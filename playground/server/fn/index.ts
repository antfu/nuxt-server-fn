export function getCWD() {
  return process.cwd()
}

export async function sayHi(name: string) {
  return `Hello ${name} from server`
}
