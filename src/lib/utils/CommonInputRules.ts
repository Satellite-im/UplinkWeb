import { InputRules } from "$lib/elements/Input/inputRules"

export class CommonInputRules {
  static username = new InputRules(4, 20, true, /^[a-zA-Z0-9]+$/)
  static friendRequestDid = new InputRules(13, 56, false, /^(did:key:[a-zA-Z0-9]{48}|[a-zA-Z0-9]+#[a-zA-Z0-9]{8})$/)
}
