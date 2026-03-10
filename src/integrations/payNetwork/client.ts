// Pay Network API integration Client

export class PayNetworkClient {
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async fetchData(endpoint: string) {
        const response = await fetch(`${this.apiUrl}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        return await response.json();
    }

    async sendData(endpoint: string, data: any) {
        const response = await fetch(`${this.apiUrl}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Error sending data: ${response.statusText}`);
        }
        return await response.json();
    }
}