import { Connection, Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL as string
export const connection = new Connection(process.env.HELIUS_RPC as string, 'confirmed')
export const TILE_SIZE = 64

export const WINRATE_SWORD_1 = parseFloat(process.env.WINRATE_STEP_1 as string)
export const WINRATE_SWORD_2 = parseFloat(process.env.WINRATE_STEP_2 as string)
export const WINRATE_SWORD_3 = parseFloat(process.env.WINRATE_STEP_3 as string)

export const WINRATE_SHIELD_1 = parseFloat(process.env.WINRATE_SHIELD_1 as string)
export const WINRATE_SHIELD_2 = parseFloat(process.env.WINRATE_SHIELD_2 as string)
export const WINRATE_SHIELD_3 = parseFloat(process.env.WINRATE_SHIELD_3 as string)

export const WINRATE_GOLD_1 = parseFloat(process.env.WINRATE_GOLD_1 as string)
export const WINRATE_GOLD_2 = parseFloat(process.env.WINRATE_GOLD_2 as string)
export const WINRATE_GOLD_3 = parseFloat(process.env.WINRATE_GOLD_3 as string)

export const FEE_STEP_1 = parseInt(process.env.FEE_STEP_1 as string)
export const FEE_STEP_2 = parseInt(process.env.FEE_STEP_2 as string)
export const FEE_STEP_3 = parseInt(process.env.FEE_STEP_3 as string)
export const FEE_STEP_4 = parseInt(process.env.FEE_STEP_4 as string)
export const FEE_STEP_5 = parseInt(process.env.FEE_STEP_5 as string)

export const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.PRIVATE_KEY as string)))
export const MINT_ADDRESS = process.env.MINT_ADDRESS as string
export const REWARD_AMOUNT = parseInt(process.env.REWARD_AMOUNT as string)
