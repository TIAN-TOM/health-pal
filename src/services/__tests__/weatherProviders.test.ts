import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCurrentWeather } from "../weatherProviders";

const city = { name: "TestCity", latitude: 1, longitude: 2 };

const openMeteoOk = {
  current: {
    temperature_2m: 20.6,
    weather_code: 2,
    relative_humidity_2m: 55,
    wind_speed_10m: 3.4,
  },
};
const wttrOk = {
  current_condition: [
    { temp_C: "18", weatherCode: "113", humidity: "60", windspeedKmph: "10.8" },
  ],
};
const metOk = {
  properties: {
    timeseries: [
      {
        data: {
          instant: { details: { air_temperature: 15, relative_humidity: 40, wind_speed: 2 } },
          next_1_hours: { summary: { symbol_code: "partlycloudy_day" } },
        },
      },
    ],
  },
};

const jsonResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  json: async () => body,
});
const failResponse = () => ({ ok: false, status: 500, json: async () => ({}) });

let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, "fetch" as any) as any;
});
afterEach(() => {
  fetchSpy.mockRestore();
});

describe("weatherProviders.getCurrentWeather", () => {
  it("uses Open-Meteo when it succeeds", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(openMeteoOk) as any);
    const res = await getCurrentWeather(city);
    expect(res.temperature).toBe(21);
    expect(res.weatherCode).toBe(2);
    expect(res.cityName).toBe("TestCity");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("falls back to wttr.in when Open-Meteo fails", async () => {
    fetchSpy
      .mockResolvedValueOnce(failResponse() as any)
      .mockResolvedValueOnce(jsonResponse(wttrOk) as any);
    const res = await getCurrentWeather(city);
    expect(res.temperature).toBe(18);
    // 10.8 km/h → 3 m/s
    expect(res.windSpeed).toBeCloseTo(3, 1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("falls back to MET Norway when the first two fail", async () => {
    fetchSpy
      .mockResolvedValueOnce(failResponse() as any)
      .mockResolvedValueOnce(failResponse() as any)
      .mockResolvedValueOnce(jsonResponse(metOk) as any);
    const res = await getCurrentWeather(city);
    expect(res.temperature).toBe(15);
    expect(res.weatherCode).toBe(2); // partlycloudy → 2
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("throws when every provider fails", async () => {
    fetchSpy.mockResolvedValue(failResponse() as any);
    await expect(getCurrentWeather(city)).rejects.toThrow(
      /All weather providers failed/
    );
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});
