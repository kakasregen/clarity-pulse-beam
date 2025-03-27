import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Test task creation and retrieval",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
        
        let block = chain.mineBlock([
            Tx.contractCall('pulse-beam', 'create-task', 
                [types.ascii("Test Task"), types.uint(deadline), types.ascii("light")],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
        
        const response = chain.callReadOnlyFn(
            'pulse-beam',
            'get-task-details',
            [types.uint(1)],
            deployer.address
        );
        
        const taskDetails = response.result.expectOk().expectTuple();
        assertEquals(taskDetails['title'], "Test Task");
        assertEquals(taskDetails['status'], "pending");
        assertEquals(taskDetails['notification-type'], "light");
    }
});

Clarinet.test({
    name: "Test task status update",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const deadline = Math.floor(Date.now() / 1000) + 86400;
        
        let block = chain.mineBlock([
            Tx.contractCall('pulse-beam', 'create-task',
                [types.ascii("Test Task"), types.uint(deadline), types.ascii("light")],
                deployer.address
            ),
            Tx.contractCall('pulse-beam', 'update-task-status',
                [types.uint(1), types.ascii("completed")],
                deployer.address
            )
        ]);
        
        block.receipts[1].result.expectOk().expectBool(true);
        
        const response = chain.callReadOnlyFn(
            'pulse-beam',
            'get-task-details',
            [types.uint(1)],
            deployer.address
        );
        
        const taskDetails = response.result.expectOk().expectTuple();
        assertEquals(taskDetails['status'], "completed");
    }
});

Clarinet.test({
    name: "Test notification preferences",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('pulse-beam', 'set-notification-preferences',
                [types.ascii("both")],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        const response = chain.callReadOnlyFn(
            'pulse-beam',
            'get-user-preferences',
            [types.principal(deployer.address)],
            deployer.address
        );
        
        const preferences = response.result.expectOk().expectTuple();
        assertEquals(preferences['notification-preference'], "both");
    }
});
