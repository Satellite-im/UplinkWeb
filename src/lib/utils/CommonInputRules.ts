import { InputRules } from "$lib/elements/Input/inputRules"

export class CommonInputRules {
  static username = new InputRules(4, 20, true, /^[a-zA-Z0-9]+$/)
}
