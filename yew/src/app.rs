use yew::prelude::*;

use crate::{elements::button::Button, enums::Appearance};

#[function_component(App)]
pub fn app() -> Html {
    let on_press = Callback::from(move |_| {});

    html! {
        <main>
            <Button text="A Button" appearance={Appearance::Alt} {on_press} />
        </main>
    }
}
