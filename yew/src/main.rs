mod app;

pub mod elements;
pub mod enums;

use app::App;

fn main() {
    yew::Renderer::<App>::new().render();
}
