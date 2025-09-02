"use client"

import Link from "next/link"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function Navigation() {
    return (
        <header className="border-b border-border py-4">
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Validators</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[200px] gap-2 p-2">
                                <li>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href="#"
                                            className="block select-none rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Dummy Item 1
                                        </Link>
                                    </NavigationMenuLink>
                                </li>
                                <li>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href="#"
                                            className="block select-none rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Dummy Item 2
                                        </Link>
                                    </NavigationMenuLink>
                                </li>
                                <li>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href="#"
                                            className="block select-none rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Dummy Item 3
                                        </Link>
                                    </NavigationMenuLink>
                                </li>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </header>
    )
}
