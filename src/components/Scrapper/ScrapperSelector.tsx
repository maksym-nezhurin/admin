import { Select } from "@mantine/core";
import { useScrapper } from "../../contexts/ScrapperContext";

export const ScrapperSelector = () => {
    const data = useScrapper();
    const { setMarket, market, allowedMarkets } = data;

    console.log('ScrapperSelector data:', { market, allowedMarkets });

    return allowedMarkets?.length && <div>
        <Select
            value={market}
            name="scrappingSource"
            label="Select the source to scrap from"
            placeholder="Pick value"
            disabled={allowedMarkets.length <= 1}
            onChange={setMarket}
            data={(allowedMarkets || []).map((opt) => ({
                label: String(opt.label),
                value: String(opt.value),
            }))}
        />
    </div>;
}