import { Select } from "@mantine/core";
import { useTranslation } from 'react-i18next';
import { useScrapper } from "../../contexts/ScrapperContext";

export const ScrapperSelector = () => {
    const { t } = useTranslation();
    const data = useScrapper();
    const { setMarket, market, allowedMarkets } = data;

    return allowedMarkets?.length && <div>
        <Select
            value={market}
            name="scrappingSource"
            label={t('scrapper.select_source')}
            placeholder={t('scrapper.pick_value')}
            disabled={allowedMarkets.length <= 1}
            onChange={setMarket}
            data={(allowedMarkets || []).map((opt) => ({
                label: String(opt.label),
                value: String(opt.value),
            }))}
        />
    </div>;
}