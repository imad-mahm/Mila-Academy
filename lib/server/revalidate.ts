import 'server-only'
import { revalidatePath } from 'next/cache'

/**
 * Call after any write that changes what the public site shows. The pages
 * otherwise cache for up to 60s (`revalidate = 60`), so without this an admin
 * would save a change and not see it on the site for a minute. Invalidating
 * the root layout covers every page beneath it.
 */
export function revalidateSite(): void {
  revalidatePath('/', 'layout')
}
