import { InputRules } from "$lib/elements/Input/inputRules"

export class CommonInputRules {
    static username = new InputRules(4, 32, true, /^[a-zA-Z0-9]{4,32}$/)
    static statusMessage = new InputRules(0, 128, false, /^.{0,128}$/)
    static friendRequestDid = new InputRules(13, 56, false, /^(did:key:[a-zA-Z0-9]{48}|[a-zA-Z0-9]+#[a-zA-Z0-9]{8})$/)
}
