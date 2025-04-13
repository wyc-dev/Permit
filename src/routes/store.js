// store.js
import { writable } from 'svelte/store';
import Web3 from "web3";

export let lang = writable("EN");

// Web3 提供者（使用 Base Sepolia 測試網）
export const Provider = writable();
export const BASE = writable(new Web3("https://mainnet.base.org"));
export const SCAN = writable("5IHYR92H2XEWMV44WI1HNIY9YSHFM4SA2B");

// testC8 合約地址
export const M9ContractAddress = writable("0xf033a9D34C4A6A0eCA0a8Cd1c4f298915e1C6F17");
// export const HKDCContractAddress = writable("0x0C793315E97c9a5FB75447a40d4C7e22A8f6ecc0");
export const TOKENContractAddress = writable("0xa1B68A58B1943Ba90703645027a10F069770ED39");

export const ERC20ABI = writable([
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function transfer(address to, uint256 amount) returns (bool)"
        ]);
export const M9ABI = writable([{"inputs":[{"internalType":"address","name":"recipient","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ECDSAInvalidSignature","type":"error"},{"inputs":[{"internalType":"uint256","name":"length","type":"uint256"}],"name":"ECDSAInvalidSignatureLength","type":"error"},{"inputs":[{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"ECDSAInvalidSignatureS","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"ERC2612ExpiredSignature","type":"error"},{"inputs":[{"internalType":"address","name":"signer","type":"address"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC2612InvalidSigner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"currentNonce","type":"uint256"}],"name":"InvalidAccountNonce","type":"error"},{"inputs":[],"name":"InvalidShortString","type":"error"},{"inputs":[{"internalType":"string","name":"str","type":"string"}],"name":"StringTooLong","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[],"name":"EIP712DomainChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"eip712Domain","outputs":[{"internalType":"bytes1","name":"fields","type":"bytes1"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"version","type":"string"},{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"address","name":"verifyingContract","type":"address"},{"internalType":"bytes32","name":"salt","type":"bytes32"},{"internalType":"uint256[]","name":"extensions","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]);
export const TOKENABI = writable([{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[],"name":"InvalidAmount","type":"error"},{"inputs":[],"name":"InvalidMerchantAddress","type":"error"},{"inputs":[],"name":"InvalidSpendingRebate","type":"error"},{"inputs":[],"name":"InvalidUserAddress","type":"error"},{"inputs":[],"name":"MerchantFrozen","type":"error"},{"inputs":[{"internalType":"address","name":"caller","type":"address"}],"name":"NotMerchantGuardian","type":"error"},{"inputs":[{"internalType":"address","name":"caller","type":"address"}],"name":"NotRegisteredMerchant","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"WithdrawFailed","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"merchant","type":"address"},{"indexed":false,"internalType":"string","name":"merchantName","type":"string"}],"name":"MerchantAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"merchant","type":"address"}],"name":"MerchantFreeze","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"merchant","type":"address"}],"name":"MerchantUnfreeze","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"merchant","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"MintedToUser","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"merchant","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"rebateAmount","type":"uint256"}],"name":"PaymentProcessed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"uint256","name":"printQuota","type":"uint256"},{"internalType":"address","name":"merchantAddr","type":"address"},{"internalType":"string","name":"merchantName","type":"string"}],"name":"addMerchant","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"merchant","type":"address"}],"name":"isMerchant","outputs":[{"internalType":"bool","name":"isWhitelisted","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"merchantByIndex","outputs":[{"internalType":"address","name":"merchant","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"merchant","type":"address"}],"name":"merchantInfoMap","outputs":[{"internalType":"address","name":"guardian","type":"address"},{"internalType":"uint256","name":"printQuota","type":"uint256"},{"internalType":"uint256","name":"totalCashReceived","type":"uint256"},{"internalType":"uint256","name":"totalPRecycled","type":"uint256"},{"internalType":"uint256","name":"spendingRebate","type":"uint256"},{"internalType":"string","name":"merchantName","type":"string"},{"internalType":"bool","name":"isFreeze","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"cashAmount","type":"uint256"}],"name":"mintToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"merchantAddr","type":"address"},{"internalType":"address","name":"newGuardian","type":"address"},{"internalType":"bool","name":"isFreeze","type":"bool"},{"internalType":"uint256","name":"printQuota","type":"uint256"},{"internalType":"uint256","name":"spendingRebate","type":"uint256"}],"name":"modMerchantState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"payMerchant","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBurnt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalMerchants","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalMinted","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"withdrawTokensAndETH","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]);
export const HKDCABI = writable([
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "initialOwner",
                                                               "type": "address"
                                                       }
                                               ],
                                               "stateMutability": "nonpayable",
                                               "type": "constructor"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "ECDSAInvalidSignature",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "length",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "ECDSAInvalidSignatureLength",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "bytes32",
                                                               "name": "s",
                                                               "type": "bytes32"
                                                       }
                                               ],
                                               "name": "ECDSAInvalidSignatureS",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "spender",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "allowance",
                                                               "type": "uint256"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "needed",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "ERC20InsufficientAllowance",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "sender",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "balance",
                                                               "type": "uint256"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "needed",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "ERC20InsufficientBalance",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "approver",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "ERC20InvalidApprover",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "receiver",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "ERC20InvalidReceiver",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "sender",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "ERC20InvalidSender",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "spender",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "ERC20InvalidSpender",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "ERC20TransferFailed",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "deadline",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "ERC2612ExpiredSignature",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "signer",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "address",
                                                               "name": "owner",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "ERC2612InvalidSigner",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "ETHTransferFailed",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "account",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "currentNonce",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "InvalidAccountNonce",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "InvalidAmount",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "InvalidMerchantAddress",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "InvalidShortString",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "InvalidUserAddress",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "MerchantFrozen",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "MerchantNotFound",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "NotAuthorizedMerchant",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "NotRegisteredMerchant",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "owner",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "OwnableInvalidOwner",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "account",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "OwnableUnauthorizedAccount",
                                               "type": "error"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "string",
                                                               "name": "str",
                                                               "type": "string"
                                                       }
                                               ],
                                               "name": "StringTooLong",
                                               "type": "error"
                                       },
                                       {
                                               "anonymous": false,
                                               "inputs": [
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "owner",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "spender",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "indexed": false,
                                                               "internalType": "uint256",
                                                               "name": "value",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "Approval",
                                               "type": "event"
                                       },
                                       {
                                               "anonymous": false,
                                               "inputs": [],
                                               "name": "EIP712DomainChanged",
                                               "type": "event"
                                       },
                                       {
                                               "anonymous": false,
                                               "inputs": [
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "merchant",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "indexed": false,
                                                               "internalType": "string",
                                                               "name": "name",
                                                               "type": "string"
                                                       }
                                               ],
                                               "name": "MerchantAdded",
                                               "type": "event"
                                       },
                                       {
                                               "anonymous": false,
                                               "inputs": [
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "merchant",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "MerchantFreeze",
                                               "type": "event"
                                       },
                                       {
                                               "anonymous": false,
                                               "inputs": [
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "merchant",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "MerchantRemoved",
                                               "type": "event"
                                       },
                                       {
                                               "anonymous": false,
                                               "inputs": [
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "merchant",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "MerchantUnfreeze",
                                               "type": "event"
                                       },
                                       {
                                               "anonymous": false,
                                               "inputs": [
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "merchant",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "user",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "indexed": false,
                                                               "internalType": "uint256",
                                                               "name": "cashAmount",
                                                               "type": "uint256"
                                                       },
                                                       {
                                                               "indexed": false,
                                                               "internalType": "uint256",
                                                               "name": "HKDCMinted",
                                                               "type": "uint256"
                                                       },
                                                       {
                                                               "indexed": false,
                                                               "internalType": "bool",
                                                               "name": "isImbalanced",
                                                               "type": "bool"
                                                       }
                                               ],
                                               "name": "MintedByMerchant",
                                               "type": "event"
                                       },
                                       {
                                               "anonymous": false,
                                               "inputs": [
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "previousOwner",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "newOwner",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "OwnershipTransferred",
                                               "type": "event"
                                       },
                                       {
                                               "anonymous": false,
                                               "inputs": [
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "merchant",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "user",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "indexed": false,
                                                               "internalType": "uint256",
                                                               "name": "amount",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "PaymentProcessed",
                                               "type": "event"
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
                                                               "indexed": true,
                                                               "internalType": "address",
                                                               "name": "to",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "indexed": false,
                                                               "internalType": "uint256",
                                                               "name": "value",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "Transfer",
                                               "type": "event"
                                       },
                                       {
                                               "stateMutability": "payable",
                                               "type": "fallback"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "DOMAIN_SEPARATOR",
                                               "outputs": [
                                                       {
                                                               "internalType": "bytes32",
                                                               "name": "",
                                                               "type": "bytes32"
                                                       }
                                               ],
                                               "stateMutability": "view",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "merchant",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "string",
                                                               "name": "name",
                                                               "type": "string"
                                                       }
                                               ],
                                               "name": "addMerchant",
                                               "outputs": [],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "owner",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "address",
                                                               "name": "spender",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "allowance",
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
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "spender",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "value",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "approve",
                                               "outputs": [
                                                       {
                                                               "internalType": "bool",
                                                               "name": "",
                                                               "type": "bool"
                                                       }
                                               ],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "account",
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
                                               "name": "eip712Domain",
                                               "outputs": [
                                                       {
                                                               "internalType": "bytes1",
                                                               "name": "fields",
                                                               "type": "bytes1"
                                                       },
                                                       {
                                                               "internalType": "string",
                                                               "name": "name",
                                                               "type": "string"
                                                       },
                                                       {
                                                               "internalType": "string",
                                                               "name": "version",
                                                               "type": "string"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "chainId",
                                                               "type": "uint256"
                                                       },
                                                       {
                                                               "internalType": "address",
                                                               "name": "verifyingContract",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "bytes32",
                                                               "name": "salt",
                                                               "type": "bytes32"
                                                       },
                                                       {
                                                               "internalType": "uint256[]",
                                                               "name": "extensions",
                                                               "type": "uint256[]"
                                                       }
                                               ],
                                               "stateMutability": "view",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "token",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "forwardERC20",
                                               "outputs": [],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "merchant",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "freezeMerchant",
                                               "outputs": [],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "merchantList",
                                               "outputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "",
                                                               "type": "address"
                                                       }
                                               ],
                                               "stateMutability": "view",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "merchantAddress",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "merchantWhitelist",
                                               "outputs": [
                                                       {
                                                               "internalType": "bool",
                                                               "name": "isWhitelisted",
                                                               "type": "bool"
                                                       }
                                               ],
                                               "stateMutability": "view",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "merchantAddress",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "merchants",
                                               "outputs": [
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "totalCashReceived",
                                                               "type": "uint256"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "totalHKDCRecycled",
                                                               "type": "uint256"
                                                       },
                                                       {
                                                               "internalType": "string",
                                                               "name": "name",
                                                               "type": "string"
                                                       },
                                                       {
                                                               "internalType": "address",
                                                               "name": "merchantAddress",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "bool",
                                                               "name": "isImbalanced",
                                                               "type": "bool"
                                                       },
                                                       {
                                                               "internalType": "bool",
                                                               "name": "isFreeze",
                                                               "type": "bool"
                                                       }
                                               ],
                                               "stateMutability": "view",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "user",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "cashAmount",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "mintHKDC",
                                               "outputs": [],
                                               "stateMutability": "nonpayable",
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
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "owner",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "nonces",
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
                                               "name": "owner",
                                               "outputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "",
                                                               "type": "address"
                                                       }
                                               ],
                                               "stateMutability": "view",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "user",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "amount",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "payMerchant",
                                               "outputs": [],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "owner",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "address",
                                                               "name": "spender",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "value",
                                                               "type": "uint256"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "deadline",
                                                               "type": "uint256"
                                                       },
                                                       {
                                                               "internalType": "uint8",
                                                               "name": "v",
                                                               "type": "uint8"
                                                       },
                                                       {
                                                               "internalType": "bytes32",
                                                               "name": "r",
                                                               "type": "bytes32"
                                                       },
                                                       {
                                                               "internalType": "bytes32",
                                                               "name": "s",
                                                               "type": "bytes32"
                                                       }
                                               ],
                                               "name": "permit",
                                               "outputs": [],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "merchant",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "removeMerchant",
                                               "outputs": [],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [],
                                               "name": "renounceOwnership",
                                               "outputs": [],
                                               "stateMutability": "nonpayable",
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
                                               "name": "totalBurnt",
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
                                               "name": "totalMinted",
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
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "to",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "value",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "transfer",
                                               "outputs": [
                                                       {
                                                               "internalType": "bool",
                                                               "name": "",
                                                               "type": "bool"
                                                       }
                                               ],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "from",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "address",
                                                               "name": "to",
                                                               "type": "address"
                                                       },
                                                       {
                                                               "internalType": "uint256",
                                                               "name": "value",
                                                               "type": "uint256"
                                                       }
                                               ],
                                               "name": "transferFrom",
                                               "outputs": [
                                                       {
                                                               "internalType": "bool",
                                                               "name": "",
                                                               "type": "bool"
                                                       }
                                               ],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "newOwner",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "transferOwnership",
                                               "outputs": [],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "inputs": [
                                                       {
                                                               "internalType": "address",
                                                               "name": "merchant",
                                                               "type": "address"
                                                       }
                                               ],
                                               "name": "unfreezeMerchant",
                                               "outputs": [],
                                               "stateMutability": "nonpayable",
                                               "type": "function"
                                       },
                                       {
                                               "stateMutability": "payable",
                                               "type": "receive"
                                       }
                               ]);

export const BASE_CHAIN_ID = writable("0x2105");
export const BASE_PARAMS = writable({
        chainId: "0x2105",
        chainName: "Base Mainnet",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.base.org"],
        blockExplorerUrls: ["https://basescan.org"],
});

export const BASE_TEST_CHAIN_ID = writable("0x14A34");
export const BASE_TEST_PARAMS = writable({
        chainId: "0x14A34",
        chainName: "Base Testnet",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://sepolia.base.org"],
        blockExplorerUrls: ["https://sepolia.basescan.org"],
});

  // function toggleNet() {
  //     if ($BASE_CHAIN_ID === "0x14A34") {
  //         // ✅ 切換到 Base Mainnet
  //         TOKENContractAddress.set("0xYourMainnetContractAddress"); // 🛑 替換為 Mainnet 智能合約地址
  //         BASE_CHAIN_ID.set("0x2105");
  //         BASE_PARAMS.set({
  //             chainId: "0x2105",
  //             chainName: "Base Mainnet",
  //             nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  //             rpcUrls: ["https://mainnet.base.org"],
  //             blockExplorerUrls: ["https://basescan.org"],
  //         });
  //     } else {
  //         // ✅ 切換回 Base Testnet
  //         TOKENContractAddress.set("0x02b886D26dd01c3531d22bB9c158052a2ad54b73");
  //         BASE_CHAIN_ID.set("0x14A34");
  //         BASE_PARAMS.set({
  //             chainId: "0x14A34",
  //             chainName: "Base Testnet",
  //             nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  //             rpcUrls: ["https://sepolia.base.org"],
  //             blockExplorerUrls: ["https://sepolia.basescan.org"],
  //         });
  //     }
  // }


export const firstTx = writable([]);
export const latest5Tx = writable([]);
export const choosed_address_for_ID = writable('');
export const choosed_address_total_power = writable(0);
export const DID_tg = writable('');
export const DID_stonfi = writable(false);
export const DID_og = writable(false);
export const DID_tonx = writable(false);
export const DID_tmm = writable(false);

export const telegram_x_TON = writable('');
export const main_address = writable('');
export const main_raw_address = writable('');
export const refer_address = writable('');
export const TT_Power = writable(0);
export const POWER_from_refer = writable(null);
export const POWER_of_refer_in_DB = writable([]);
export const refer_in_DB = writable([]);
export const assets_list = writable([]);
export const assets_worth_in_TON = writable(0);
export const tonConnectUI = writable(null);
export const TON_price = writable(0);
export const TON_balance = writable(0);
export const TON_apiKey = writable("a9e903e8592ca3474a7c41bcec2509d96330ab522f7327dc0c28e884c113499c");
export const usdt_minter = writable("0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe");
export const dogs_minter = writable("0:afc49cb8786f21c87045b19ede78fc6b46c51048513f8e9a6d44060199c1bf0c");
export const hmstr_minter = writable("0:09f2e59dec406ab26a5259a45d7ff23ef11f3e5c7c21de0b0d2a1cbe52b76b3d");
export const redo_minter = writable("0:59fdc69f3f20ebe4a513b3468dc61d194c3864a4464e3662c903648d1a52e6e0");
export const usdt_balance =  writable(0);
export const dogs_balance =  writable(0);
export const hmstr_balance = writable(0);
export const redo_balance = writable(0);
export const usdt_worth =  writable(0);
export const dogs_worth =  writable(0);
export const hmstr_worth = writable(0);
export const redo_worth = writable(0);

// NFT
    export const check_stonfi = writable(false);
    export const check_og = writable(false);
    export const check_tonx = writable(false);
    // export const check_tmm = writable(false);



// let Address = "EQD4AmT6rPCvU2erwtuAY9TzQMAblCn3WEL5M8PkqgyA3Be7";
// let Address = "UQALUY7lNkc10kypNpKEA5GwfPLepBgGLc1LBJmbAF15VGea";
// let Address = "EQAx4ZA4eHb4jIVvyeUgHnQV74EwLzbMBkVLq2iRrtMd7Az8";
// let Address = "EQCt_eubODNxYwYaQa44w6AGQANp5PthG0jNRA2cqsI4WHHa";
// let Address = "EQALUY7lNkc10kypNpKEA5GwfPLepBgGLc1LBJmbAF15VDpf";

// 