use yew::prelude::*;

use crate::enums::Appearance;

#[derive(Clone, PartialEq, Properties)]
pub struct Props {
    pub text: String,
    pub appearance: Appearance,
    pub on_press: Callback<MouseEvent>,
}

#[function_component(Button)]
pub fn button(props: &Props) -> Html {
    let Props { text, on_press , appearance} = props.clone();

    html! {
        <link data-trunk rel="sass" href="style.scss" />
        <button
            class={format!("button {}", appearance.to_string())}
            onclick={move |e: MouseEvent|  on_press.emit(e)}
        >
            {text}
        </button>
    }
}
