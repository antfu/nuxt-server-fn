import type { H3Event } from "h3"

export async function sayHi(name: string) {
  // eslint-disable-next-line no-console
  console.log(`Hi ${name}`)
  return `Hello ${name} from server, ${Date.now()}`
}

export function sayHey(this: H3Event, name: string = "there") {
  return `Hey ${name}! from ${this.path}, ${Date.now()}`
}

export async function sayHello(this: H3Event, ms: number = 1000) {
  await new Promise((resolve) => setTimeout(resolve, ms))
  return `Hello after ${ms}ms from ${this.path}, ${Date.now()}`
}
