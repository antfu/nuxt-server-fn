export async function sayHi(name: string) {
  // eslint-disable-next-line no-console
  console.log(`Hi ${name}`)
  return `Hello ${name} from server, ${Date.now()}`
}
