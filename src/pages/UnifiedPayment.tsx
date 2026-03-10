import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';

const UnifiedPayment = () => {
    return (
        <Tabs defaultActiveKey="pay-network" id="uncontrolled-tab-example" className="mb-3">
            <Tab eventKey="pay-network" title="Pay Network">
                <h2>Pay Network Payment Methods</h2>
                {/* Add Pay Network payment methods here */}
            </Tab>
            <Tab eventKey="pi-network" title="Pi Network">
                <h2>Pi Network Payment Methods</h2>
                {/* Add Pi Network payment methods here */}
            </Tab>
            <Tab eventKey="wallet" title="Wallet">
                <h2>Wallet Payment Methods</h2>
                {/* Add Wallet payment methods here */}
            </Tab>
            <Tab eventKey="local" title="Local">
                <h2>Local Payment Methods</h2>
                {/* Add Local payment methods here */}
            </Tab>
        </Tabs>
    );
};

export default UnifiedPayment;
