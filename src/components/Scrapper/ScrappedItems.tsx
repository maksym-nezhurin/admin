// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { apiClient } from '../../utils/apiClient';
// import { Button, Select } from '@mantine/core';
// import { Paper } from "@mantine/core";
// import type { IResponse, IParsedCarItem } from '../../types/scrapper';

// const limits = [10, 20, 30, 50, 100];

// export const ScrappedItems = () => {
//     const [resultTitle, setResultTitle] = useState('Items will be shown here');
//     const [limit, setLimit] = useState<number>(limits[2]);
//     const handleChangeLimit = (value: string) => {
//         const newLimit = parseInt(value, 10);
//         setLimit(newLimit);
//     };
//     const [data, setItems] = useState<IResponse<IParsedCarItem>>({
//         items: [],
//         total: 0,
//         limit: limit,
//         offset: 0,
//         count: 0
//     });

//     return <Paper withBorder shadow="md" p={20} radius="md">
//         <h4>Scrapped Items</h4>

//         <div>
//             <h4>View all items from DB</h4>

//             <div style={{
//                 display: 'flex',
//                 alignItems: 'self-end',
//                 gap: '10px',
//                 marginBottom: '10px',
//                 width: '100%',
//                 justifyContent: 'space-between',
//                 }}>
//                 <Button onClick={async () => {
//                     const res = await apiClient.get('/items', {
//                         params: {
//                             offset: 0,
//                             limit: limit,
//                         }
//                     });

//                     setItems(res.data);
//                     setResultTitle(`Found ${res.data.total} items in total in DB.`);
//                 }}>Fetch All Items</Button>

//                 <Select
//                     label="Limit"
//                     data={limits.map((limit) => ({
//                         label: limit.toString(),
//                         value: limit.toString(),
//                     }))}
//                     value={String(limit)}
//                     onChange={handleChangeLimit}
//                 />
//             </div>

//             <div>
//                 {
//                     data.items.length > 0 ? (
//                         <ul>
//                             <h4>{resultTitle}</h4>
//                             {data.items.map((item, index) => (
//                                 <li key={index}>
//                                     {item.title}, {' / '}
//                                     <span>
//                                         <span style={{ fontStyle: 'italic', fontWeight: 'bolder', marginRight: '4px' }}>
//                                             Price:
//                                         </span>
//                                         <span style={{ fontWeight: 'bold' }}>
//                                             {item.price}
//                                         </span>

//                                     </span>
//                                      {' / '}
//                                     <span>
//                                         <span style={{ fontStyle: 'italic', marginRight: '4px' }}>
//                                             Phone:
//                                         </span>
//                                         <span style={{ fontWeight: 'bold' }}>
//                                             {item.phone}
//                                         </span>

//                                     </span>
                                    
//                                     {' - '}
//                                     <Link to={`${item.url}`} target="_blank" rel="noopener noreferrer">
//                                         open
//                                     </Link>
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p>{resultTitle}</p>
//                     )
//                 }

//                 <div
//                     style={{ display: 'flex', justifyContent: 'center', gap: 15, width: '100%', marginTop: '10px' }} 
//                 >
                
//                     <Button disabled={data.offset === 0} onClick={async () => {
//                         const newOffset = Math.max(0, data.offset - data.limit);
//                         const res = await apiClient.get('/items', {
//                             params: {
//                                 offset: newOffset,
//                                 limit: data.limit,
//                             }
//                         });
//                         setItems(res.data);
//                     }}>Previous</Button>
//                     <div
//                         style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '12px' }}
//                     >
//                         Page {Math.floor(data.offset / data.limit) + 1} of {Math.ceil(data.total / data.limit)}
//                     </div>
//                     <Button disabled={data.offset + data.limit >= data.total} onClick={async () => {
//                         const newOffset = data.offset + data.limit;
//                         const res = await apiClient.get('/items', {
//                             params: {
//                                 offset: newOffset,
//                                 limit: data.limit,
//                             }
//                         });
//                         setItems(res.data);
//                     }}>Next</Button>
//                 </div>
//             </div>
//         </div>
//     </Paper>;
// }