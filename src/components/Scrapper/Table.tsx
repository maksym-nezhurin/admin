import { useState, useCallback, useRef } from 'react';
import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { MenuModule } from '@ag-grid-enterprise/menu'; // if using enterprise features

// Register modules you actually need
ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule]);

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const CustomFooter = (props) => {
  const { api, total = 0, displayedCount = 0 } = props
//   const received = api ? api.getDisplayedRowCount() : 0

  return (
    <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-t text-sm text-gray-600">
      <span>Received: {displayedCount} of {total}</span>
    </div>
  )
}

export const ScrapperTable = ({
    rowData = [],
}) => {
    const [loading, setLoading] = useState(false); // стан preloader
    const gridApiRef = useRef(null);
    const [displayedCount, setDisplayedCount] = useState(0);

    const columnDefs = [
        {
        field: 'title',
        cellRenderer: (params) => {
            return (
                <Link to={params.data.url} target="_blank" rel="noopener noreferrer">
                    {params.value}
                </Link>
            );
        },
        checkboxSelection: true
        },
        { field: 'price' },
        { field: 'mileage' },
        { field: 'phone' },
        { field: 'year' },
        { field: 'registration_number' },
    ];

    //   const columns = Array.from({ length: 11 }, (_, i) => ({
    //     field: `extra_${i + 1}`,
    //     headerName: (() => {
    //         // беремо перший рядок у rowData для цього поля
    //         const sampleValue = rowData[0]?.[`extra_${i + 1}`] || '';
    //         const parts = sampleValue.split('\n');
    //         return parts[1] || `Extra ${i + 1}`; // друга частина або fallback
    //     })(),
    //     width: 150,
    //     cellStyle: { whiteSpace: 'pre-line' }, // перенос рядка для значення
    //   }));

    const columns = [];

    const getSelectedRows = useCallback(() => {
        if (!gridApiRef.current) return;
        const selectedNodes = gridApiRef.current.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data);
        console.log('Вибрані машини:', selectedData);
        alert(JSON.stringify(selectedData, null, 2));
    }, []);

    return (
        <div>
        <div style={{ width: '100%', height: '550px' }}>
            {/* <Button onClick={getSelectedRows} style={{ marginBottom: '14px' }}>
            Опрацювати вибрані
            </Button> */}
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
            {loading && (
                <div
                style={{
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
                columnDefs={[...columnDefs, ...columns]}
                rowSelection="multiple"
                onGridReady={(params) => {
                    gridApiRef.current = params.api;
                    params.api.addEventListener('modelUpdated', () => {
                        console.log('modelUpdated event fired');
                        setDisplayedCount(params.api.getDisplayedRowCount());
                    });
                }}
                pagination={true}
            />

                <CustomFooter
                 api={gridApiRef.current}
                 displayedCount={displayedCount}
                 total={rowData.length}
                />
            </div>
        </div>
        </div>
    );
}