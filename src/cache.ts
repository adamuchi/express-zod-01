const cache: {[key: string]: any}= {};

export async function getCacheValue(key: string) {
    return cache[key];
}

export async function putCacheValue(key: string, value: any) {
    cache[key] = value;
}