import Map from "@/components/Map/Map";
import WelcomeCard from "@/components/WelcomeCard/WelcomeCard";
import ExploreRail from "@/components/ExploreRail/ExploreRail";
import {
  getCountryMarkers,
  getProtectedAreas,
  getSpecies,
  getStates,
} from "@/lib/data";

export default async function Home() {
  const [states, species, protectedAreas, markers] = await Promise.all([
    getStates(),
    getSpecies(),
    getProtectedAreas(),
    getCountryMarkers(),
  ]);

  return (
    <div className="absolute inset-0">
      <Map states={states} species={species} protectedAreas={protectedAreas} markers={markers} />
      <ExploreRail />
      <WelcomeCard />
    </div>
  );
}
