import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
// import { MenuModule } from '@ag-grid-enterprise/menu';
import type { 
  GridApi, 
  ColDef, 
  GridReadyEvent,
//   ModelUpdatedEvent,
//   FirstDataRenderedEvent
} from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import type { IParsedCarItem } from '../../types/scrapper';

interface ScrapperTableProps {
  rowData: IParsedCarItem[];
}

const CustomFooter = (props: { total?: number; displayedCount?: number }) => {
  const { total = 0, displayedCount = 0 } = props;

  return (
    <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-t text-sm text-gray-600">
      <span>Received: {displayedCount} of {total}</span>
    </div>
  )
}

export const ScrapperTable = ({
    rowData = [],
}: ScrapperTableProps) => {
    const [loading/*, setLoading*/] = useState(false); // стан preloader
    const gridApiRef = useRef<GridApi | null>(null);
    const [displayedCount, setDisplayedCount] = useState(0);

    const columnDefs: ColDef[] = [
        {
        field: 'title',
        cellRenderer: (params: { data: IParsedCarItem; value: string }) => (
            <Link to={params.data.url} target="_blank" rel="noopener noreferrer">
            {params.value}
            </Link>
        ),
        checkboxSelection: true
        },
        { 
        field: 'price',
        filter: 'agNumberColumnFilter'
        },
        { 
        field: 'mileage',
        filter: 'agNumberColumnFilter'
        },
        { 
        field: 'phone' 
        },
        { 
        field: 'year',
        filter: 'agNumberColumnFilter'
        },
        { 
        field: 'registration_number' 
        }
    ];

   const onGridReady = useCallback((params: GridReadyEvent) => {
        gridApiRef.current = params.api;
        setDisplayedCount(params.api.getDisplayedRowCount());
    }, []);

    const onModelUpdated = useCallback((/*params: ModelUpdatedEvent*/) => {
        if (gridApiRef.current) {
            setDisplayedCount(gridApiRef.current.getDisplayedRowCount());
        }
    }, []);

    const onFirstDataRendered = useCallback((/*params: FirstDataRenderedEvent*/) => {
        // params.columnApi.autoSizeAllColumns();
    }, []);

    return (
        <div style={{ width: '100%', height: '550px' }}>
            {/* <Button onClick={getSelectedRows} style={{ marginBottom: '14px' }}>
            Опрацювати вибрані
            </Button> */}
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.8)',
                    zIndex: 10,
                }}
                >
                <div className="loader">Loading...</div>
                </div>
            )}
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                rowSelection="multiple"
                onGridReady={onGridReady}
                onModelUpdated={onModelUpdated}
                onFirstDataRendered={onFirstDataRendered}
                pagination={true}
                paginationPageSize={20}
                suppressCellFocus={true}
                suppressRowClickSelection={true}
            />

                <CustomFooter
                 displayedCount={displayedCount}
                 total={rowData.length}
                />
            </div>
        </div>
    );
}
