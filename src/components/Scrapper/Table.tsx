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
import { format } from 'date-fns';
import { Badge } from '@mantine/core';

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

const renderStatus = (status: string) => {
  switch (status) {
    case 'active': return <Badge color="green">Active</Badge>;
    case 'archived': return <Badge color="red">Archived</Badge>;
    case 'sold': return <Badge color="blue">Sold</Badge>;
    default: return <div>{status || '-'}</div>;
  }
}

export const ScrapperTable = ({
    rowData = [],
}: ScrapperTableProps) => {
    const [loading/*, setLoading*/] = useState(false); // стан preloader
    const gridApiRef = useRef<GridApi | null>(null);
    const [displayedCount, setDisplayedCount] = useState(0);

    const columnDefs: ColDef[] = [
        {
            field: 'id',
            filter: 'agNumberColumnFilter',
            headerName: 'ID',
            width: 100,
            sortable: true,
            // filter: true,
            // resizable: true,
            pinned: 'left',
            lockPinned: true,
            cellRenderer: (params: { data: IParsedCarItem; value: string }) => (
                <Link to={params.data.url} target="_blank" rel="noopener noreferrer">
                    {(params.data.id ?? params.data.url).toString()}
                </Link>
            ),
        },
        { 
            field: 'phone',
            filter: 'agTextColumnFilter',
            headerName: 'Phone',
            width: 170,
            sortable: true,
            // filter: true,
            // resizable: true,
            pinned: 'left',
            lockPinned: true,
            cellRenderer: (params: { data: IParsedCarItem; value: string }) => (
                <span>{params.value}</span>
            ),
        },
        {
            field: 'title',
            cellRenderer: (params: { data: IParsedCarItem; value: string }) => (
                <Link to={params.data.url} target="_blank" rel="noopener noreferrer">
                    <span>{renderStatus(params.data.status ?? '')}</span>
                    <span style={{ marginLeft: '8px' }}>{params.value}</span>
                </Link>
            ),
        },
        {
            field: 'vin',
        },
        {
            field: 'createdAt',
            cellRenderer: (params: { data: IParsedCarItem; value: string }) => (
                <span>{format(new Date(params.value), 'dd.MM.yyyy HH:mm')}</span>
            ),
            filter: 'agDateColumnFilter'
        },
        {
            field: 'sellerName',
        },
        {
            field: 'totalAds',
        },
        {
            field: 'activeAds',
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
