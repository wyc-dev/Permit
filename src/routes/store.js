// store.js
import { writable } from 'svelte/store';

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