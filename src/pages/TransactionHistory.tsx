import React from 'react';
import { Table } from 'antd'; // Assuming Ant Design for the table
import { Button } from 'antd';

const TransactionHistory = () => {
    const data = [/* Transaction data */];

    const exportTransactions = () => {
        // Logic to export transactions
    };

    const columns = [
        {
            title: 'Transaction ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => (
                <span style={{ color: text === 'Completed' ? 'green' : 'red' }}>
                    {text}
                </span>
            ),
        },
    ];

    return (
        <div>
            <h1>Transaction History</h1>
            <Button type="primary" onClick={exportTransactions}>Export</Button>
            <Table columns={columns} dataSource={data} />
        </div>
    );
};

export default TransactionHistory;
