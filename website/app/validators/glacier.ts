"use server"

export interface BLSCredentials {
    publicKey: string
    proofOfPossession: string
}

export interface Owner {
    addresses: string[]
    threshold: number
}

export interface GlacierL1Validator {
    validationId: string
    validationIdHex: string
    creationTimestamp: number
    nodeId: string
    subnetId: string
    weight: number
    remainingBalance: number
    blsCredentials: BLSCredentials
    remainingBalanceOwner: Owner
    deactivationOwner: Owner
}

export interface GlacierL1ValidatorsResponse {
    validators: GlacierL1Validator[]
    blockHeight: string
    nextPageToken?: string
}


export async function GlacierGetL1Validators(): Promise<GlacierL1Validator[]> {
    const allValidators: GlacierL1Validator[] = []
    let nextPageToken: string | undefined = undefined

    do {
        const url = nextPageToken
            ? `https://glacier-api.avax.network/v1/networks/mainnet/l1Validators?pageSize=100&pageToken=${nextPageToken}`
            : `https://glacier-api.avax.network/v1/networks/mainnet/l1Validators?pageSize=100`

        const response = await fetch(url, { next: { revalidate: 60 * 60 } })//cache for an hour

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: GlacierL1ValidatorsResponse = await response.json()

        allValidators.push(...data.validators)
        nextPageToken = data.nextPageToken

    } while (nextPageToken)

    return allValidators
}

