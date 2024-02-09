use yew::prelude::*;

use crate::enums::Appearance;

#[derive(Clone, PartialEq, Properties)]
pub struct Props {
    pub text: String,
    pub appearance: Appearance,
    pub on_press: Callback<Event>,
}

#[function_component(Button)]
pub fn butotn(props: &Props) -> Html {
    let Props { text, on_press , appearance} = props.clone();

    html! {
        <button class={format!("button {}", appearance.to_string())} onclick={move |e: Event|  on_press.emit(e)}>
            {text}
        </button>
    }
}
