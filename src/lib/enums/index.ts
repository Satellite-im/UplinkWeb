export * from "./icons"

export const enum ChatType {
    Group,
    DirectMessage
}

export const enum Locale {
    EN_US   = "English (US)",
    ES_MX   = "Español (México)",
    PT_BR   = "Português (Brasil)",
    PT_PT   = "Português (Portugal)",
    DE      = "Deutsch",
    SR_RS   = "Serbia (Srbija)",
    HR_HR   = "Croatia (Hrvatska)",
    PL      = "Polski (Polska)",
    BS_BA   = "Bosnia and Hercegovina (Bosna i Hercegovina)"
}

export const enum Font {
    Poppins         = "Poppins",
    SpaceMono       = "SpaceMono",
    ChakraPetch     = "ChakraPetch",
    Comfortaa       = "Comfortaa",
    Dosis           = "Dosis",
    IBMPlexMono     = "IBMPlexMono",
    IndieFlower     = "IndieFlower",
    JosefinSans     = "JosefinSans",
    Noto            = "Noto",
    SourceCodePro   = "SourceCodePro",
    SpaceGrotesk    = "SpaceGrotesk",
    PixelifySans    = "PixelifySans",
    MajorMono       = "MajorMono",
    Merriweather    = "Merriweather",
    PoiretOne       = "PoiretOne",
    OpenDyslexic    = "OpenDyslexic"
}

export const enum Route {
    Home = "/",
    Chat = "/chat",
    Files = "/files",
    Friends = "/friends",
    Wallet = "/wallet",
    Settings = "/settings/profile",
    Unlock = "/auth/unlock",
    RecoverySeed = "/auth/recovery",
    NewAccount = "/auth/new_account"
}

export const enum FilesItemKind {
    File,
    Folder,
    Image,
}

export const enum SettingsRoute {
    Profile         = "/settings/profile",
    Preferences     = "/settings/preferences",
    Messages        = "/settings/messages",
    AudioVideo      = "/settings/audio_video",
    Extensions      = "/settings/extensions",
    Keybinds        = "/settings/keybinds",
    Accessability   = "/settings/accessability",
    Notifications   = "/settings/notifications",
    About           = "/settings/about",
    Licenses        = "/settings/licenses",
    Developer       = "/settings/developer"
}

export const enum Appearance {
    Default         = "",
    Alt             = "alt",
    Success         = "success",
    Info            = "info",
    Warning         = "warning",
    Error           = "error",
    Primary         = "primary",
    Transparent     = "transparent"
}

export const enum Size {
    Smallest    = "smallest",
    Smaller     = "smaller",
    Small       = "small",
    Medium      = "medium",
    Large       = "large",
    Larger      = "larger",
    Largest     = "largest"
}

export const enum MessagePosition {
    First    = "first",
    Middle   = "middle",
    Last     = "last"
}

export const enum MessageAttachmentKind {
    File = "File",
    Image = "Image",
    URL = "URL",
    User = "User",
    STL = "STL",
    Audio = "Audio"
}

export const enum Status {
    Online          = "online",
    Offline         = "offline",
    Idle            = "idle",
    DoNotDisturb    = "do-not-disturb",
}

export const enum KeybindAction {
    IncreaseFontSize    = "Increase font size within Uplink.",
    DecreaseFontSize    = "Decrease font size within Uplink.",
    ToggleMute          = "Mute & un-mute your microphone.",
    ToggleDeafen        = "Toggle turning off all sounds including your microphone and headphones.",
    OpenInspector       = "Open/Close Web Inspector",
    ToggleDevmode       = "Toggle Developer Mode",
    FocusUplink         = "Hide/Focus Uplink",
}

export enum MessageDirection {
    Inbound,
    Outbound,
    Unknown
}