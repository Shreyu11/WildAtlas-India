import Map from "@/components/Map/Map";
import WelcomeCard from "@/components/WelcomeCard/WelcomeCard";
import ExploreRail from "@/components/ExploreRail/ExploreRail";
import FunFactCard from "@/components/FunFactCard/FunFactCard";
import MapViewSettings from "@/components/MapViewSettings/MapViewSettings";
import {
  getCountryMarkers,
  getFunFacts,
  getProtectedAreas,
  getSpecies,
  getSpeciesDensity,
  getStates,
  getZoos,
} from "@/lib/data";

export default async function Home() {
  const [states, species, protectedAreas, zoos, speciesDensity, markers, funFacts] = await Promise.all([
    getStates(),
    getSpecies(),
    getProtectedAreas(),
    getZoos(),
    getSpeciesDensity(),
    getCountryMarkers(),
    getFunFacts(),
  ]);

  return (
    <div className="absolute inset-0">
      <Map
        states={states}
        species={species}
        protectedAreas={protectedAreas}
        zoos={zoos}
        speciesDensity={speciesDensity}
        markers={markers}
      />
      <ExploreRail species={species} />
      <MapViewSettings />
      <WelcomeCard />
      <FunFactCard facts={funFacts} species={species} />
    </div>
  );
}
