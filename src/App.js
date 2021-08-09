import React, { useEffect, useState } from "react";
import { useTable, usePagination, useSortBy } from 'react-table'
import 'bootstrap/dist/css/bootstrap.min.css';
import mydata from "./mydata/data.json";
import styled from "styled-components";
// import fetch from 'node-fetch' 
// change

const Styles = styled.div`

  .page-link {
    color: black;

  }

`




function Table({ columns, data }) {
    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: 0,
                pageSize: 10,
                sortBy: [
                    {
                        id: 'date',
                        desc: true
                    }
                ]
            },
        },
        useSortBy,

        usePagination

    )
    // Render the UI for your table
    return (
        <div>
            <table className="table" {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                    {column.render('Header')}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>

                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
            <ul className="pagination">
                <li className="page-item" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    <a className="page-link">First</a>
                </li>
                <li className="page-item" onClick={() => previousPage()} disabled={!canPreviousPage}>
                    <a className="page-link">{'<'}</a>
                </li>
                <li className="page-item" onClick={() => nextPage()} disabled={!canNextPage}>
                    <a className="page-link">{'>'}</a>
                </li>
                <li className="page-item" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    <a className="page-link">Last</a>
                </li>
                <li>
                    <a className="page-link">
                        Page{' '}
                        <strong>
                            {pageIndex + 1} of {pageOptions.length}
                        </strong>{' '}
                    </a>
                </li>
                <li>
                    <a className="page-link">
                        <input
                            className="form-control"
                            type="number"
                            defaultValue={pageIndex + 1}
                            onChange={e => {
                                const page = e.target.value ? Number(e.target.value) - 1 : 0
                                gotoPage(page)
                            }}
                            style={{ width: '100px', height: '20px' }}
                        />
                    </a>
                </li>{' '}
                <select
                    className="form-control"
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value))
                    }}
                    style={{ width: '120px', height: '38px' }}
                >
                    {[5, 10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </ul>
        </div >
    )
}

function PaginationTableComponent() {

    // 내가 받아오는 data는 dynamic 하니까 useState로 담기
    // const [mydata, setData] = useState()
    // // fetch data로 가져온다고 보기
    // const fetchData = () => {
    //     fetch("./mydata/data.json")
    //         .then(res => setData(res.json))
    // };
    // useEffect(() => {
    //     fetchData()
    // }, []);


    const columns = React.useMemo(
        () => [
            {
                Header: 'Date',
                accessor: 'date',
                //  width: 100,
            },
            {
                Header: 'Title2',
                accessor: 'title',
                className: "title",
                //  width: 250,
                Cell: ({ row }) => <a href={row.original.url}>{row.original.title}</a>,
            },
            {
                Header: 'Title(en)',
                accessor: 'translated',
                className: "title",
                // width: 250,  
            },
            {
                Header: 'Likes',
                accessor: 'likes',
                //  width: 60,

            },

        ],
        [processData(mydata)]
    )

    function processData(jsonData) {
        const result = Object.keys(jsonData).map((key) => {return jsonData[key]; });
        return result;
      }

    const data = React.useMemo(
        () => processData(mydata),
        [processData(mydata)]
    )



    return (
        <Styles>
            <Table columns={columns} data={data} />
        </Styles>
    )
}

export default PaginationTableComponent;


