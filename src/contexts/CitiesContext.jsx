import { createContext, useContext, useEffect, useReducer } from "react";
import { supabase } from "../services/supabase";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };
    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };
    case "rejected":
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const { data, error } = await supabase.from("cities").select("*");

        if (error) throw error;

        const transformedData = data.map((city) => ({
          ...city,
          position: { lat: city.lat, lng: city.lng },
        }));

        dispatch({ type: "cities/loaded", payload: transformedData });
      } catch (err) {
        dispatch({
          type: "rejected",
          payload: "There was an error loading cities...",
        });
      }
    }
    fetchCities();
  }, []);

  async function getCity(id) {
    if (id === currentCity.id) return;

    dispatch({ type: "loading" });
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const transformedCity = {
        ...data,
        position: { lat: data.lat, lng: data.lng },
      };

      dispatch({ type: "city/loaded", payload: transformedCity });
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error loading the city...",
      });
    }
  }

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const supabaseCity = {
        id: crypto.randomUUID().split("-")[0],
        cityName: newCity.cityName,
        country: newCity.country,
        emoji: newCity.emoji,
        date: newCity.date,
        notes: newCity.notes,
        lat: newCity.position.lat,
        lng: newCity.position.lng,
      };
      const { data, error } = await supabase
        .from("cities")
        .insert([supabaseCity])
        .select();
      if (error) throw error;

      const finalCity = {
        ...data[0],
        position: { lat: data[0].lat, lng: data[0].lng },
      };

      dispatch({ type: "city/created", payload: finalCity });
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error creating the city...",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      const { error } = await supabase.from("cities").delete().eq("id", id);

      if (error) throw error;

      dispatch({ type: "city/deleted", payload: id });
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the city...",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
