import SkyTemplate from "@/components/Templates/SkyTemplate";
import NeonTemplate from "@/components/Templates/NeonTemplate";
import CoffeeTemplate from "@/components/Templates/CoffeeTemplate";
import EmeraldTemplate from "@/components/Templates/EmeraldTemplate";
import NoirTemplate from "@/components/Templates/NoirTemplate";
import OceanicTemplate from "@/components/Templates/OceanicTemplate";
import PharaonicTemplate from "@/components/Templates/PharaonicTemplate";
import ArcaneTemplate from "@/components/Templates/Arcane";
import MusicTemplate from "@/components/Templates/MusicTemplate";
import RetroCoffeeTemplate from "@/components/Templates/RetroCoffeeTemplate";
import OneCardTemplate from "@/components/Templates/OneCardTemplate";
import WaffleTemplate from "@/components/Templates/WaffleTemplate";
import VanillaTemplate from "@/components/Templates/VanillaTemplate";

export const templates: Record<string, React.ComponentType> = {
    sky: SkyTemplate,
    neon: NeonTemplate,
    coffee: CoffeeTemplate,
    emerald: EmeraldTemplate,
    noir: NoirTemplate,
    oceanic: OceanicTemplate,
    pharaonic: PharaonicTemplate,
    arcane: ArcaneTemplate,
    music: MusicTemplate,
    retro: RetroCoffeeTemplate,
    vanilla: VanillaTemplate,
    waffle: WaffleTemplate,
    default: OneCardTemplate,
};