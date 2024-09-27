import {
  BASE_URL,
  connection,
  FEE_STEP_1,
  FEE_STEP_2,
  FEE_STEP_3,
  FEE_STEP_4,
  FEE_STEP_5,
  FROM_KEYPAIR,
  MINT_ADDRESS,
  WINRATE_SWORD_1,
  WINRATE_SWORD_2,
  WINRATE_SWORD_3,
  WINRATE_SHIELD_1,
  WINRATE_SHIELD_2,
  WINRATE_SHIELD_3,
  WINRATE_GOLD_1,
  WINRATE_GOLD_2,
  WINRATE_GOLD_3,
} from '@/app/constants'
import { blinksights } from '@/services/blinksight'
import { ActionGetResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from '@solana/actions'
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token'
import { ComputeBudgetProgram, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { NextResponse } from 'next/server'



export async function GET(req: Request) {
  let response: ActionGetResponse = await blinksights.createActionGetResponseV1(req.url, {
    type: 'action',
    icon: `${BASE_URL}/vn_flag.png`,
    title: 'StartPage',
    description: 'Click Start to start',
    label: '',
    links: {
      actions: [
        {
          label: 'Start',
          href: '/api/action?stage=start&step=0',
        },
        
      ],
    },
  })
  return NextResponse.json(response, {
    headers: ACTIONS_CORS_HEADERS,
  })
}

const MAPS = [
  {
    id: 'desert-01',
    name: 'Orange Desert',
    enemies: [
      {
        id: 'enemy-01',
        name: 'Orange Enemy',
        health: 10,
        attack: 10,
        position: [0, 0],
      },
      {
        id: 'enemy-02',
        name: 'Orange Enemy',
        health: 20,
        attack: 20,
        position: [0, 0],
      },
      {
        id: 'enemy-03',
        name: 'Orange Enemy',
        health: 30,
        attack: 30,
        position: [0, 0],
      },
      {
        id: 'enemy-04',
        name: 'Orange Enemy',
        health: 70,
        attack: 70,
        position: [0, 0],
      },
      {
        id: 'enemy-05',
        name: 'Orange Enemy',
        health: 60,
        attack: 60,
        position: [0, 0],
      },
    ],
  },
  {
    id: 'desert-02',
    name: 'Blue Desert',
    enemies: [
      {
        id: 'enemy-01',
        name: 'Blue Enemy',
        health: 10,
        attack: 10,
        position: [0, 0],
      },
      {
        id: 'enemy-02',
        name: 'Blue Enemy',
        health: 20,
        attack: 20,
        position: [0, 0],
      },
      {
        id: 'enemy-03',
        name: 'Blue Enemy',
        health: 30,
        attack: 30,
        position: [0, 0],
      },
      {
        id: 'enemy-04',
        name: 'Blue Enemy',
        health: 70,
        attack: 70,
        position: [0, 0],
      },
      {
        id: 'enemy-05',
        name: 'Blue Enemy',
        health: 60,
        attack: 60,
        position: [0, 0],
      },
    ],
  },
]

type Player = {
  health: number,
  damage: number,
  gameState: {
    currentEnemies: string[]
    killedEnemies: string[]
  },
  rndMapId: string,
  step: number,
}

const Gift: {sword: string[]; shiled: string[], gold: number[]}= {
    sword:["ssr", "sr", "r"],
    shiled:["ssr", "sr", "r"],
    gold:[100000000, 10000000, 1000000]
}

type Reward = {
  id: string
  name: string
  type: string
  rate: number
  quantity: number
}

type Rewards ={
  [key: string] : {
    name: string
    variants: Reward[]
  }
}

const REWARDS : Rewards = {
  sword: {
    name: 'Sword',
    variants : [
        {
          id: 'ssr-sword',
          name: 'SSR Sword',
          type: 'ssr',
          rate: 0.1,
          quantity: 1
        },
        {
          id:'sr-sword',
          name:'SR Sword',
          type:'sr',
          rate:0.3,
          quantity: 1
        },
        {
          id:'r-sword',
          name:'R Sword',
          type: 'r',
          rate: 0.6,
          quantity: 1
        }
    ]
  },
  shield: {
    name: 'Shield',
    variants : [
        {
          id: 'ssr-shield',
          name: 'SSR Shield',
          type: 'ssr',
          rate: 0.1,
          quantity: 1
        },
        {
          id:'sr-shield',
          name:'SR Shield',
          type:'sr',
          rate:0.3,
          quantity: 1
        },
        {
          id:'r-shield',
          name:'R Shield',
          type: 'r',
          rate: 0.6,
          quantity: 1
        }
    ]
  },
  gold: {
    name: 'Gold',
    variants : [
        {
          id: 'lg-gold',
          name: '100M',
          type: 'srr',
          rate: 0.1,
          quantity: 100000000
        },
        {
          id:'m-gold',
          name:'10M',
          type:'sr',
          rate:0.3,
          quantity: 10000000
        },
        {
          id:'sm-gold',
          name:'1M',
          type: 'r',
          rate: 0.6,
          quantity: 1000000
        }
    ]
  },
  
}

const PLAYER: Record<string, Player> = {
  dummy: {
    health :100,
    damage: 10,
    gameState: {
      currentEnemies: ['enemy-01', 'enemy-02', 'enemy-03', 'enemy-04', 'enemy-05'],
      killedEnemies: [],
    },
    rndMapId: '',
    step: 0,
  }
}



// ensures cors
export const OPTIONS = GET

export async function POST(req: Request) {
  const body = (await req.json()) as { account: string; signature: string }
  const { searchParams } = new URL(req.url)

  const sender = new PublicKey(body.account)

  const stage = searchParams.get('stage') as string
  const step = parseInt(searchParams.get('step') as string)   
  const direction = searchParams.get('direction') as string
  const claim = Boolean(searchParams.get('claim'))

  if(stage === 'start') { 

    const transaction = await createBlankTransaction(sender)

    if (step === 0) 
    {
        PLAYER[body.account] = {
          health :100,
          damage: 10,
          gameState: {
            currentEnemies: ['enemy-01', 'enemy-02', 'enemy-03', 'enemy-04', 'enemy-05'],
            killedEnemies: [],
          },
          rndMapId: getRandomMap(),
          step: 0,
        }
    }
    if(direction === 'enm1' && PLAYER[body.account].gameState.currentEnemies.length>=1) {

      const enemyToRemove = PLAYER[body.account].gameState.currentEnemies[0];
      const currentMap = MAPS.find(map => map.id === PLAYER[body.account].rndMapId)

      if (currentMap){
       const enemy = currentMap.enemies.find(e => e.id === enemyToRemove)

       if (enemy) {
          if(PLAYER[body.account].damage >= enemy.health) {              
            PLAYER[body.account].damage += enemy.attack, 

            PLAYER[body.account].gameState.currentEnemies = PLAYER[body.account].gameState.currentEnemies.filter((enemy) => enemy !== enemyToRemove)
    
            PLAYER[body.account].gameState.killedEnemies.push(enemyToRemove)
          }
          else {
            const payload = await createPostResponse({
              fields: {
                links: {
                  next: {
                    type: 'inline',
                    action: {
                      description: ``,
                      icon: `${BASE_URL}/youlose.png`,
                      label: ``,
                      title: `Your damage not enough, try again!!`,
                      type: 'action',
                      links: {
                        actions: [
                          {
                            label: `Try Again`,
                            href: `/api/action?stage=start&step=0`,
                          },
                        ],
                      },
                    },
                  },
                },
                transaction: transaction,
              },
            }) 
            return NextResponse.json(payload, {
              headers: ACTIONS_CORS_HEADERS,
            })
          }     
        }
      }

    }
    else if(direction === 'enm2' && PLAYER[body.account].gameState.currentEnemies.length>=2) {
      const enemyToRemove = PLAYER[body.account].gameState.currentEnemies[1];
    
      const currentMap = MAPS.find(map => map.id === PLAYER[body.account].rndMapId)

      if (currentMap){
        const enemy = currentMap.enemies.find(enemies => enemies.id === enemyToRemove)
        if (enemy) {
          if(PLAYER[body.account].damage >= enemy.health) {
            PLAYER[body.account].damage += enemy.attack, 

            PLAYER[body.account].gameState.currentEnemies = PLAYER[body.account].gameState.currentEnemies.filter((enemy) => enemy !== enemyToRemove)
    
            PLAYER[body.account].gameState.killedEnemies.push(enemyToRemove)
            }
          else {
            const payload = await createPostResponse({
              fields: {
                links: {
                  next: {
                    type: 'inline',
                    action: {
                      description: ``,
                      icon: `${BASE_URL}/youlose.png`,
                      label: ``,
                      title: `Your damage not enough, try again!!`,
                      type: 'action',
                      links: {
                        actions: [
                          {
                            label: `Try Again`,
                            href: `/api/action?stage=start&step=0`,
                          },
                        ],
                      },
                    },
                  },
                },
                transaction: transaction,
              },
            })
    
            return NextResponse.json(payload, {
              headers: ACTIONS_CORS_HEADERS,
            })
          }
        }
      }      
    }

    if (PLAYER[body.account].gameState.currentEnemies.length >1 )
    {
      const transaction = await createFeeTransaction(sender.toString(), calculateFee(step))
      const image = `${BASE_URL}/pictures/${step+1}.png`
      const payload = await createPostResponse ( {
        fields: {
          links: {
            next: {
              type: 'inline',
              action: {
                description:`YourDamage: ${PLAYER[body.account].damage}`,
                icon: image,
                label: `{step}`,
                title: `Step : ${step + 1}; Map : ${PLAYER[body.account].rndMapId}`,
                type: 'action',
                links: {
                    actions: [
                      {
                        label: `${PLAYER[body.account].gameState.currentEnemies[0]}`,
                        href: `/api/action?stage=start&direction=enm1&step=${step + 1}`,
                      },
                      {
                        label: `${PLAYER[body.account].gameState.currentEnemies[1]}`,
                        href: `/api/action?stage=start&direction=enm2&step=${step + 1}`,
                      }
                    ]
                }
              }
            }
          },
          transaction,
        }  
      })
      return NextResponse.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      })
    }
    else if(PLAYER[body.account].gameState.currentEnemies.length === 1 )
    {
      const transaction = await createFeeTransaction(sender.toString(), calculateFee(step))
      const image = `${BASE_URL}/pictures/${step+1}.png`
      const payload = await createPostResponse ( {
        fields: {
          links: {
            next: {
              type: 'inline',
              action: {
                description:`YourDamage: ${PLAYER[body.account].damage}`,
                icon: image,
                label: `{step}`,
                title: `Step : ${step + 1}; Map : ${PLAYER[body.account].rndMapId}`,
                type: 'action',
                links: {
                    actions: [
                      {
                        label: `${PLAYER[body.account].gameState.currentEnemies[0]}`,
                        href: `/api/action?stage=start&direction=enm1&step=${step + 1}`,
                      },
                    ]
                }
              }
            }
          },
          transaction,
        }  
      })
      return NextResponse.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      })
    }
    else if(PLAYER[body.account].gameState.currentEnemies.length === 0)
    {
      const transaction = await createFeeTransaction(sender.toString(), calculateFee(step))
      const payload = await createPostResponse ( {
        fields: {
          links: {
            next: {
              type: 'inline',
              action: {
                description:``,
                icon: `${BASE_URL}/Yeah.png`,
                label: ``,
                title: `You Win`,
                type: 'action',
                links: {
                    actions: [
                      {
                        label: `Open Chest`,
                        href: `/api/action?stage=finish&claim=true`,
                      },
                    ]
                }
              }
            }
          },
          transaction,
        }  
      })

      return NextResponse.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
      })
    }
  }

  if (stage === 'finish') {
    if (claim) {
      
      const generateRewards = () => {
        const Rewards: { [key: string]: string[]} ={}
        for (const [key, value] of Object.entries(REWARDS)) {
          Rewards[key] = value.variants.flatMap((variant) => Array(Math.floor(variant.rate* 100)).fill(variant.name))
        }
        return Rewards
      }

      const rewards = generateRewards()

      const randomSword = () => {
        const randomIndex = Math.floor(Math.random() * rewards.sword.length)
        return rewards.sword[randomIndex]
      }
      
      const randomShield = () => {
        const randomIndex = Math.floor(Math.random() * rewards.shield.length)
        return rewards.sword[randomIndex]
      }

      const randomGold = () => {
        const randomIndex = Math.floor(Math.random() * rewards.gold.length)
        return rewards.gold[randomIndex]
      }
      
      const transaction = await createBlankTransaction(sender)
        const payload = await createPostResponse({
          fields: {
            links: {
              next: {
                type: 'inline',
                action: {
                  description:`Sword:${randomSword()} ; Shield:${randomShield()} ; Gold:${randomGold()}`,
                  icon: `${BASE_URL}/Chest.png`,
                  label: ``,
                  title: `🎉🎉🎉`,
                  type: 'action',
                  links: {
                    actions: [
                      {
                        label: `Play Again`,
                        href: `/api/action?stage=start&step=0`
                      }
                    ]
                  }
                }
              }
            },
            transaction,
          }
        })


        return NextResponse.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      }) 
    }
  }

  return NextResponse.json({
    status: 400,
    headers: ACTIONS_CORS_HEADERS,
  })

}


const createBlankTransaction = async (sender: PublicKey) => {
  const transaction = new Transaction()
  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1000,
    }),
    new TransactionInstruction({
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from('This is a blank memo transaction'),
      keys: [],
    }),
  )
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.feePayer = sender

  return transaction
}

function getRandomMap(){
  const randomIndex = Math.floor(Math.random() * MAPS.length);
  return MAPS[randomIndex].id;
}
function calculateFee(step: number): number {
  switch (step) {
    case 1:
      return FEE_STEP_1
    case 2:
      return FEE_STEP_2
    case 3:
      return FEE_STEP_3
    case 4:
      return FEE_STEP_4
    case 5:
      return FEE_STEP_5
    default:
      return 0
  }
}

async function createFeeTransaction(recipient: string, fee: number) {
  let destinationAccount = await getOrCreateAssociatedTokenAccount(connection, FROM_KEYPAIR, new PublicKey(MINT_ADDRESS), FROM_KEYPAIR.publicKey)

  let sourceAccount = await getOrCreateAssociatedTokenAccount(connection, FROM_KEYPAIR, new PublicKey(MINT_ADDRESS), new PublicKey(recipient))
  const tx = new Transaction()
  tx.add(createTransferInstruction(sourceAccount.address, destinationAccount.address, new PublicKey(recipient), fee * 1e6))

  const latestBlockHash = await connection.getLatestBlockhash('confirmed')
  tx.recentBlockhash = latestBlockHash.blockhash
  tx.feePayer = new PublicKey(recipient)
  return tx
}

