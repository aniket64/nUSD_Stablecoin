const Web3 = require('web3');
const { assert } = require('chai');

const web3 = new Web3('https://rinkeby.infura.io/v3/$infura_id');

const contractAddress = '0x609BB88Fc54071C9f445120e76FBfbCe1E31AfAC';
const contractABI = [

    {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_priceFeed",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ethAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "nusdAmount",
                "type": "uint256"
            }
        ],
        "name": "Deposit",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "nusdAmount",
                "type": "uint256"
            }
        ],
        "name": "redeem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "nusdAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ethAmount",
                "type": "uint256"
            }
        ],
        "name": "Redeem",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getETHPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }

];
const contract = new web3.eth.Contract(contractABI, contractAddress);

describe('nUSD Stablecoin', () => {
    let accounts;
    let defaultAccount;

    before(async () => {

        accounts = await web3.eth.getAccounts();
        defaultAccount = 0xde670903Dbee3b25150a29011501a021136eef8F;


        web3.eth.defaultAccount = defaultAccount;
    });

    it('should deposit ETH and mint nUSD', async () => {
        const amount = web3.utils.toWei('1', 'ether');

        // Deposit ETH
        await contract.methods.deposit().send({
            value: amount,
            from: defaultAccount,
        });

        // Get nUSD balance after deposit
        const balance = await contract.methods.balanceOf(defaultAccount).call();

        // Assert that nUSD balance is equal to deposited ETH amount divided by 2
        assert.equal(balance, amount / 2, 'Incorrect nUSD balance after deposit');
    });

    it('should redeem nUSD and burn tokens', async () => {
        const amount = web3.utils.toWei('500', 'ether');

        // Approve the contract to spend nUSD
        await contract.methods.approve(contractAddress, amount).send({
            from: defaultAccount,
        });

        // Redeem nUSD
        await contract.methods.redeem(amount).send({
            from: defaultAccount,
        });

        // Get nUSD balance after redemption
        const balance = await contract.methods.balanceOf(defaultAccount).call();

        // Assert that nUSD balance is zero after redemption
        assert.equal(balance, 0, 'nUSD balance is not zero after redemption');
    });

    it('should update total supply correctly', async () => {
        // Get initial total supply
        const initialSupply = await contract.methods.totalSupply().call();

        // Depsit ETH
        const amount = web3.utils.toWei('2', 'ether');
        await contract.methods.deposit().send({
            value: amount,
            from: defaultAccount,
        });

        // Get total supply after deposit
        const updatedSupply = await contract.methods.totalSupply().call();

        // Assert that total supply is increased by the depositd amount divided by 2
        assert.equal(
            updatedSupply - initialSupply,
            amount / 2,
            'Incorrect total supply update'
        );
    });
});
