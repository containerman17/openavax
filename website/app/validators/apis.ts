'use server'

import { GlacierGetBlockchains, GlacierGetL1Validators } from "./glacier"

export interface ValidatorData {
    nodeId: string
    version: string
    trackedSubnets: string[]
    lastAttempted: number
    lastSeenOnline: number
    ip: string
}

export async function getValidatorFromDiscoveryAPI(): Promise<ValidatorData[]> {

    const response = await fetch(process.env.VALIDATOR_DISCOVERY_HOST!, { next: { revalidate: 10 } })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ValidatorData[] = await response.json()

    const processedData = data.map((validator) => {
        const { version, ...rest } = validator
        let versionString = version || 'Unknown'
        if (version.includes('/')) {
            versionString = version.split('/')[1]
        }
        return { version: versionString || 'Unknown', ...rest } as ValidatorData
    })

    return processedData
}


export async function GlacierGetSubnetToValidators(): Promise<Map<string, string[]>> {
    const validators = await GlacierGetL1Validators()
    const subnetToValidators = new Map<string, string[]>()
    for (const validator of validators) {
        if (!validator.remainingBalance) continue;
        if (!subnetToValidators.has(validator.subnetId)) {
            subnetToValidators.set(validator.subnetId, [])
        }
        subnetToValidators.get(validator.subnetId)!.push(validator.nodeId)
    }
    return subnetToValidators
}

export async function getBlockchainNamesMapping(): Promise<Map<string, string>> {
    const blockchains = await GlacierGetBlockchains()
    const blockchainNamesMapping = new Map<string, string>()
    for (const blockchain of blockchains) {
        blockchainNamesMapping.set(blockchain.subnetId, blockchain.blockchainName)
    }
    return blockchainNamesMapping
}
