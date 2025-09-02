
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ValidatorData {
    nodeId: string
    version: string
    trackedSubnets: string[]
    lastAttempted: number
    lastSeenOnline: number
    ip: string
}

type ValidatorDataWithoutIP = Omit<ValidatorData, 'ip'>

async function getValidators(): Promise<ValidatorDataWithoutIP[]> {
    'use server'

    try {
        const response = await fetch('https://validator-discovery-asia.fly.dev/')

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ValidatorData[] = await response.json()

        const processedData = data.map((validator) => {
            const { ip, version, ...rest } = validator
            let versionString = version || 'Unknown'
            if (version.includes('/')) {
                versionString = version.split('/')[1]
            }
            return { version: versionString || 'Unknown', ...rest } as ValidatorDataWithoutIP
        })

        return processedData
    } catch (error) {
        console.error('Failed to fetch validators:', error)
        return []
    }
}

export default async function OutdatedValidators() {
    const validators = await getValidators()

    // Find and sort all versions 
    const allVersions = validators.map(v => v.version).filter(v => v !== 'Unknown')
    const sortedVersions = allVersions.length > 0
        ? [...new Set(allVersions)].sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }))
        : []
    const latestVersion = sortedVersions[0] || ''

    // Version color mapping
    const getVersionStyle = (version: string) => {
        if (version === 'Unknown') return { variant: 'destructive' as const, className: 'bg-red-500' }

        const versionIndex = sortedVersions.indexOf(version)
        switch (versionIndex) {
            case 0: return { variant: 'default' as const, className: 'bg-green-500 hover:bg-green-600' }  // Latest
            case 1: return { variant: 'secondary' as const, className: 'bg-blue-500 hover:bg-blue-600 text-white' }  // 1 behind
            default: return { variant: 'destructive' as const, className: 'bg-red-500' }  // 3+ behind
        }
    }

    // Group validators by subnet, then by version within each subnet
    const subnetData = new Map<string, Map<string, ValidatorDataWithoutIP[]>>()

    validators.forEach(validator => {
        validator.trackedSubnets.forEach(subnetId => {
            if (!subnetData.has(subnetId)) {
                subnetData.set(subnetId, new Map())
            }

            const subnetVersions = subnetData.get(subnetId)!
            if (!subnetVersions.has(validator.version)) {
                subnetVersions.set(validator.version, [])
            }

            subnetVersions.get(validator.version)!.push(validator)
        })
    })

    // Convert to array and sort by total validators (descending)
    const subnets = Array.from(subnetData.entries())
        .map(([subnetId, versions]) => {
            const totalValidators = Array.from(versions.values()).reduce((sum, validators) => sum + validators.length, 0)
            return { subnetId, versions, totalValidators }
        })
        .sort((a, b) => b.totalValidators - a.totalValidators)

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Validator Versions by Subnet</h1>
                <p className="text-muted-foreground mb-4">
                    Monitoring {subnets.length} subnets • {validators.length} validators total • Latest: {latestVersion}
                </p>
                <div className="flex gap-2 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Latest</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>1 behind</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>2+ behind / Unknown</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {subnets.map(({ subnetId, versions, totalValidators }) => (
                    <Card key={subnetId}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-mono text-sm">
                                {subnetId}
                            </CardTitle>
                            <CardDescription>
                                {totalValidators} validators total
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Array.from(versions.entries())
                                    .sort((a, b) => {
                                        // Sort by version number descending (1.13.5 -> 1.13.4 -> etc.)
                                        if (a[0] === 'Unknown') return 1
                                        if (b[0] === 'Unknown') return -1
                                        return b[0].localeCompare(a[0], undefined, { numeric: true, sensitivity: 'base' })
                                    })
                                    .map(([version, validators]) => {
                                        const count = validators.length
                                        const percentage = Math.round((count / totalValidators) * 100)
                                        const isLatest = version === latestVersion
                                        const style = getVersionStyle(version)

                                        return (
                                            <div key={version} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant={style.variant}
                                                            className={`font-mono text-xs ${style.className}`}
                                                        >
                                                            {version}
                                                        </Badge>
                                                        {isLatest && (
                                                            <span className="text-xs text-green-600 font-medium">latest</span>
                                                        )}
                                                    </div>
                                                    <div className="font-semibold">
                                                        {count} ({percentage}%)
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-300 ${style.className.replace('hover:bg-', 'bg-')}`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {subnets.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No validator data available
                </div>
            )}
        </div>
    )
}

