use std::fmt;

#[derive(Clone, PartialEq)]
pub enum Appearance {
    Primary,
    Alt,
    Info,
    Success,
    Warning,
    Error
}

impl fmt::Display for Appearance {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Appearance::Primary => write!(f, "primary"),
            Appearance::Alt => write!(f, "alt"),
            Appearance::Info => write!(f, "info"),
            Appearance::Success => write!(f, "success"),
            Appearance::Warning => write!(f, "warning"),
            Appearance::Error => write!(f, "error"),
        }
    }
}