import { Abi, CallData, events, hash, num, RpcProvider } from 'starknet';
import cron from 'node-cron';
import { UserCollection } from '../database/schema';

type EmittedEvent = Parameters<typeof events.parseEvents>[0][0];

type EventFilter = {
    address: string;
    fromBlock?: number;
    toBlock?: number;
    keys?: string[][];
    chunkSize?: number;
};

class StarknetEventFetcher {
    private provider: RpcProvider;
    
    constructor(provider: RpcProvider) {
        this.provider = provider;
    }
    
    async fetchEvents(filter: EventFilter, abi: Abi) {
        const fromBlock = filter.fromBlock ?? 0;
        let toBlock = filter.toBlock;
        if (toBlock === undefined) {
            const lastBlock = await this.provider.getBlock('latest');
            toBlock = lastBlock.block_number;
        }
        const chunkSize = filter.chunkSize ?? 10;
        
        let continuationToken: string | undefined = '0';
        const events = [];
        
        while (continuationToken) {
            const eventsRes = await this.provider.getEvents({
                address: filter.address,
                from_block: { block_number: fromBlock },
                to_block: { block_number: toBlock },
                keys: filter.keys ?? [[]],
                chunk_size: chunkSize,
                continuation_token: continuationToken === '0' ? undefined : continuationToken,
            });
            
            const parsedEvents = eventsRes.events.map(event => this.parseEvent(event, abi));
            
            events.push(...parsedEvents);
            continuationToken = eventsRes.continuation_token;
        }
        
        return events;
    }
    
    private parseEvent(event: EmittedEvent, abi: Abi) {
        const abiEvents = events.getAbiEvents(abi);
        const abiStructs = CallData.getAbiStruct(abi);
        const abiEnums = CallData.getAbiEnum(abi);
        return events.parseEvents([event], abiEvents, abiStructs, abiEnums);
    }
    
    async getContractAbi(contractAddress: string): Promise<Abi> {
        const { abi } = await this.provider.getClassAt(contractAddress);
        if (!abi) {
            throw new Error('No ABI found for contract');
        }
        return abi;
    }
}

export function registerCronJobs(nodeUrl: string, contractAddress: string) {
    const provider = new RpcProvider({ nodeUrl });
    const fetcher = new StarknetEventFetcher(provider);
    
    let fromBlock: number | undefined;
    let toBlock: number | undefined;
    
    cron.schedule('*/5 * * * *', async () => {
        if (!fromBlock && !toBlock) {
            const lastBlock = await provider.getBlock('latest');
            fromBlock = lastBlock.block_number - 1;
            toBlock = lastBlock.block_number;
        } else {
            fromBlock = toBlock;
            const lastBlock = await provider.getBlock('latest');
            toBlock = lastBlock.block_number;
        }
        
        const creditFilter: EventFilter = {
            address: contractAddress,
            keys: [[num.toHex(hash.starknetKeccak('Credit'))]],
            fromBlock,
            toBlock,
        };
        
        const debitFilter: EventFilter = {
            address: contractAddress,
            keys: [[num.toHex(hash.starknetKeccak('Debit'))]],
            fromBlock,
            toBlock,
        };
        
        const abi = await fetcher.getContractAbi(contractAddress);
        
        const creditEvents = await fetcher.fetchEvents(creditFilter, abi);
        const debitEvents = await fetcher.fetchEvents(debitFilter, abi);
        
        if (creditEvents.length) {
            for (const parsedEvent of creditEvents) {
                const eventData = parsedEvent[0]['agentforge::AgentForge::Credit'];
                const wallet = typeof eventData['wallet'] === 'bigint' ? '0x0' + eventData['wallet'].toString(16) : undefined;
                const amount = typeof eventData['amount'] === 'bigint' ? Number(eventData['amount']) : undefined;
                if (wallet && amount) {
                    const user = await UserCollection.findOne({ walletAddress: wallet });
                    if (user) await UserCollection.updateOne({ walletAddress: wallet }, { $inc: { credits: amount } });
                }
            }
        }
        if (debitEvents.length) {
            // TODO: Implement
        }
    });
}