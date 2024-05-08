/* tslint:disable */
/* eslint-disable */
/**
* Used to generate a random user name
*
* # Example
*
* ```
* use warp::multipass::generator;
* let name = generator::generate_name();
*
* assert!(name.len() <= 32);
* ```
* @returns {string}
*/
export function generate_name(): string;
/**
*/
export enum IdentityUpdate {
  Username = 0,
  Picture = 1,
  PicturePath = 2,
  PictureStream = 3,
  ClearPicture = 4,
  Banner = 5,
  BannerPath = 6,
  BannerStream = 7,
  ClearBanner = 8,
  StatusMessage = 9,
  ClearStatusMessage = 10,
}
/**
*/
export enum TesseractEvent {
  Unlocked = 0,
  Locked = 1,
}
/**
*/
export enum Identifier {
  DID = 0,
  DIDList = 1,
  Username = 2,
  Own = 3,
}
/**
*/
export class Identity {
  free(): void;
/**
* @param {string} user
*/
  set_username(user: string): void;
/**
* @param {string | undefined} [message]
*/
  set_status_message(message?: string): void;
/**
* @param {string} id
*/
  set_short_id(id: string): void;
/**
* @param {string} pubkey
*/
  set_did_key(pubkey: string): void;
/**
* @param {Date} time
*/
  set_created(time: Date): void;
/**
* @param {Date} time
*/
  set_modified(time: Date): void;
/**
* @returns {string}
*/
  username(): string;
/**
* @returns {string | undefined}
*/
  status_message(): string | undefined;
/**
* @returns {string}
*/
  short_id(): string;
/**
* @returns {string}
*/
  did_key(): string;
/**
* @returns {Date}
*/
  created(): Date;
/**
* @returns {Date}
*/
  modified(): Date;
}
/**
* Profile containing the newly created `Identity` and a passphrase, if applicable.
*/
export class IdentityProfile {
  free(): void;
/**
* @param {Identity} identity
* @param {string | undefined} [passphrase]
* @returns {IdentityProfile}
*/
  static new(identity: Identity, passphrase?: string): IdentityProfile;
/**
* @returns {Identity}
*/
  identity(): Identity;
/**
* @param {Identity} identity
*/
  set_identity(identity: Identity): void;
/**
* @returns {string | undefined}
*/
  passphrase(): string | undefined;
}
/**
*/
export class MultiPassBox {
  free(): void;
/**
* @param {string | undefined} [username]
* @param {string | undefined} [passphrase]
* @returns {Promise<IdentityProfile>}
*/
  create_identity(username?: string, passphrase?: string): Promise<IdentityProfile>;
/**
* @param {Identifier} id_variant
* @param {any} id_value
* @returns {Promise<any>}
*/
  get_identity(id_variant: Identifier, id_value: any): Promise<any>;
/**
* @returns {Promise<Identity>}
*/
  get_own_identity(): Promise<Identity>;
/**
* @param {IdentityUpdate} option
* @param {any} value
* @returns {Promise<void>}
*/
  update_identity(option: IdentityUpdate, value: any): Promise<void>;
}
/**
* Wraps BoxStream<'static, TesseractEvent> into a js compatible struct
*/
export class Subscription {
  free(): void;
/**
* @returns {Promise<Promise<any>>}
*/
  next(): Promise<Promise<any>>;
}
/**
* The key store that holds encrypted strings that can be used for later use.
*/
export class Tesseract {
  free(): void;
/**
* To create an instance of Tesseract
*/
  constructor();
/**
* Enable the ability to autosave
*
* # Example
*
* ```
* let mut tesseract = warp::tesseract::Tesseract::default();
* tesseract.set_autosave();
* assert!(tesseract.autosave_enabled());
* ```
*/
  set_autosave(): void;
/**
* Check to determine if `Tesseract::autosave` is true or false
*
* # Example
*
* ```
* let mut tesseract = warp::tesseract::Tesseract::default();
* assert!(!tesseract.autosave_enabled());
* ```
* @returns {boolean}
*/
  autosave_enabled(): boolean;
/**
* Disable the key check to allow any passphrase to be used when unlocking the datastore
*
* # Example
*
* ```
* use warp::tesseract::Tesseract;
* let mut tesseract = Tesseract::default();
*
* assert!(!tesseract.is_key_check_enabled());
*
* tesseract.enable_key_check();
*
* assert!(tesseract.is_key_check_enabled());
*
* tesseract.disable_key_check();
*
* assert!(!tesseract.is_key_check_enabled());
* ```
*/
  disable_key_check(): void;
/**
* Enable the key check to allow any passphrase to be used when unlocking the datastore
*
* # Example
*
* ```
* use warp::tesseract::Tesseract;
* let mut tesseract = Tesseract::default();
*
* assert!(!tesseract.is_key_check_enabled());
*
* tesseract.enable_key_check();
*
* assert!(tesseract.is_key_check_enabled())
* ```
*/
  enable_key_check(): void;
/**
* Check to determine if the key check is enabled
*
* # Example
*
* ```
* use warp::tesseract::Tesseract;
* let mut tesseract = Tesseract::new();
* assert!(!tesseract.is_key_check_enabled());
* //TODO: Perform a check with it enabled
* ```
* @returns {boolean}
*/
  is_key_check_enabled(): boolean;
/**
* Check to see if the key store contains the key
*
* # Example
*
* ```
*  let mut tesseract = warp::tesseract::Tesseract::default();
*  tesseract.unlock(&warp::crypto::generate::<32>()).unwrap();
*  tesseract.set("API", "MYKEY").unwrap();
*  assert_eq!(tesseract.exist("API"), true);
*  assert_eq!(tesseract.exist("NOT_API"), false);
* ```
* @param {string} key
* @returns {boolean}
*/
  exist(key: string): boolean;
/**
* Used to clear the whole keystore.
*
* # Example
*
* ```
*  let mut tesseract = warp::tesseract::Tesseract::default();
*  tesseract.unlock(&warp::crypto::generate::<32>()).unwrap();
*  tesseract.set("API", "MYKEY").unwrap();
*  tesseract.clear();
*  assert_eq!(tesseract.exist("API"), false);
* ```
*/
  clear(): void;
/**
* Checks to see if tesseract is secured and not "unlocked"
*
* # Example
*
* ```
*  let mut tesseract = warp::tesseract::Tesseract::default();
*  assert!(!tesseract.is_unlock());
*  tesseract.unlock(&warp::crypto::generate::<32>()).unwrap();
*  assert!(tesseract.is_unlock());
*  tesseract.set("API", "MYKEY").unwrap();
*  tesseract.lock();
*  assert!(!tesseract.is_unlock())
* ```
* @returns {boolean}
*/
  is_unlock(): boolean;
/**
* Remove password from memory securely
*
* # Example
*
* ```
*  let mut tesseract = warp::tesseract::Tesseract::default();
*  tesseract.unlock(&warp::crypto::generate::<32>()).unwrap();
*  assert!(tesseract.is_unlock());
*  tesseract.lock();
*  assert!(!tesseract.is_unlock());
* ```
*/
  lock(): void;
/**
* @param {string} key
* @param {string} value
*/
  set(key: string, value: string): void;
/**
* @param {string} key
* @returns {string}
*/
  retrieve(key: string): string;
/**
* @param {Uint8Array} old_passphrase
* @param {Uint8Array} new_passphrase
*/
  update_unlock(old_passphrase: Uint8Array, new_passphrase: Uint8Array): void;
/**
* @param {string} key
*/
  _delete(key: string): void;
/**
* @param {Uint8Array} passphrase
*/
  unlock(passphrase: Uint8Array): void;
/**
*/
  save(): void;
/**
* @returns {AsyncIterator<any>}
*/
  subscribe(): AsyncIterator<any>;
/**
* Used to load contents from local storage
*/
  load_from_storage(): void;
}
/**
* Wraps in the TesseractEvent promise result in the js object expected by js async iterator
*/
export class TesseractEventPromiseResult {
  free(): void;
/**
*/
  done: boolean;
/**
*/
  value: TesseractEvent;
}
/**
*/
export class WarpInstance {
  free(): void;
/**
*/
  readonly multipass: MultiPassBox;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_tesseract_free: (a: number) => void;
  readonly tesseract_new: () => number;
  readonly tesseract_set_autosave: (a: number) => void;
  readonly tesseract_autosave_enabled: (a: number) => number;
  readonly tesseract_disable_key_check: (a: number) => void;
  readonly tesseract_enable_key_check: (a: number) => void;
  readonly tesseract_is_key_check_enabled: (a: number) => number;
  readonly tesseract_exist: (a: number, b: number, c: number) => number;
  readonly tesseract_clear: (a: number) => void;
  readonly tesseract_is_unlock: (a: number) => number;
  readonly tesseract_lock: (a: number) => void;
  readonly tesseract_set: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly tesseract_retrieve: (a: number, b: number, c: number, d: number) => void;
  readonly tesseract_update_unlock: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly tesseract__delete: (a: number, b: number, c: number, d: number) => void;
  readonly tesseract_unlock: (a: number, b: number, c: number, d: number) => void;
  readonly tesseract_save: (a: number, b: number) => void;
  readonly tesseract_subscribe: (a: number) => number;
  readonly tesseract_load_from_storage: (a: number, b: number) => void;
  readonly __wbg_subscription_free: (a: number) => void;
  readonly subscription_next: (a: number) => number;
  readonly __wbg_tesseracteventpromiseresult_free: (a: number) => void;
  readonly __wbg_get_tesseracteventpromiseresult_value: (a: number) => number;
  readonly __wbg_set_tesseracteventpromiseresult_value: (a: number, b: number) => void;
  readonly __wbg_get_tesseracteventpromiseresult_done: (a: number) => number;
  readonly __wbg_set_tesseracteventpromiseresult_done: (a: number, b: number) => void;
  readonly warpinstance_multipass: (a: number) => number;
  readonly __wbg_multipassbox_free: (a: number) => void;
  readonly multipassbox_create_identity: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly multipassbox_get_identity: (a: number, b: number, c: number) => number;
  readonly multipassbox_get_own_identity: (a: number) => number;
  readonly multipassbox_update_identity: (a: number, b: number, c: number) => number;
  readonly __wbg_warpinstance_free: (a: number) => void;
  readonly __wbg_identityprofile_free: (a: number) => void;
  readonly identityprofile_new: (a: number, b: number, c: number) => number;
  readonly identityprofile_identity: (a: number) => number;
  readonly identityprofile_set_identity: (a: number, b: number) => void;
  readonly identityprofile_passphrase: (a: number, b: number) => void;
  readonly __wbg_identity_free: (a: number) => void;
  readonly identity_set_username: (a: number, b: number, c: number) => void;
  readonly identity_set_status_message: (a: number, b: number, c: number) => void;
  readonly identity_set_short_id: (a: number, b: number, c: number) => void;
  readonly identity_set_did_key: (a: number, b: number, c: number) => void;
  readonly identity_set_created: (a: number, b: number) => void;
  readonly identity_set_modified: (a: number, b: number) => void;
  readonly identity_username: (a: number, b: number) => void;
  readonly identity_status_message: (a: number, b: number) => void;
  readonly identity_short_id: (a: number, b: number) => void;
  readonly identity_did_key: (a: number, b: number) => void;
  readonly identity_created: (a: number) => number;
  readonly identity_modified: (a: number) => number;
  readonly generate_name: (a: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ha7fa496d54d0cb4c: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h2658efcc204e3bbc: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
