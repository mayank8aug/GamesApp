import React from 'react';
import './GamesComponent.css';

export class GamesComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            dataSet: [],
            filteredData: [],
            pageNo: 1,
            searchKey: ''
        }
        this.sortOrder = '';
        this.sortData = this.sortData.bind(this);
    }

    componentDidMount() {
        this.readData();
    }

    readData() {
        const storageData = localStorage.getItem('gamesData');
        if (storageData) {
            const parsedData = JSON.parse(storageData);
            this.setState({ dataSet: parsedData });
            this.setState({ filteredData: parsedData });
        } else {
            fetch("/data.csv")
            .then(res => res.text())
            .then(fileData => {
                const csvData = fileData.split(/\r\n|\n/);
                const keys = csvData[0].split(',');
                const values = [];
                let data;
                let item;
                for (let i = 1; i < csvData.length; i++) {
                    data = csvData[i].split(',');
                    if (data.length === keys.length) {
                        item = {};
                        for (var j = 0; j < keys.length; j++) {
                            item[keys[j].toLowerCase()] = data[j];
                        }
                        values.push(item);
                    }
                }
                if (values.length) {
                    localStorage.setItem('gamesData', JSON.stringify(values));
                    this.setState({ dataSet: values });
                    this.setState({ filteredData: values });
                }
            });
        }
    }

    handleEnter(e) {
        if (e.keyCode === 13) {
            var val = document.getElementById('pageNoId').value;
            if (val < 1)
                val = 1;
            if (val > Math.ceil(this.state.filteredData.length / 20))
                val = Math.ceil(this.state.filteredData.length / 20);
            this.setState({ pageNo: val });
            document.getElementById('pageNoId').value = val;
        }
    }

    filterDataSet(e) {
        const searchQuery = e.target.value;
        this.setState({ searchKey: searchQuery });
        let dataToBeRendered = [];
        const data = this.state.dataSet;
        let dataItem;
        for (let i = 0; i < data.length; i++) {
            dataItem = data[i];
            for (let key in dataItem) {
                if (dataItem.hasOwnProperty(key) && this.hasQueryMatched(searchQuery, dataItem[key])) {
                    dataToBeRendered.push(dataItem);
                    break;
                }
            }
        }
        this.setState({ filteredData: dataToBeRendered });
        this.setState({ pageNo: 1 });
        document.getElementById('pageNoId').value = 1;
    }

    hasQueryMatched(searchQuery, value) {
        return ((value + '').toLowerCase().indexOf(searchQuery) > -1);
    }

    sortData(field) {
        debugger;
        const currentData = JSON.parse(JSON.stringify(this.state.filteredData));
        const sortedData = currentData.sort((a, b) => {
            return this.sortOrder !== 'desc' ? Number(a[field]) - Number(b[field]) : Number(b[field]) - Number(a[field]);
        });
        if (this.sortOrder !== 'desc') {
            this.sortOrder = 'desc';
        } else {
            this.sortOrder = 'asc';
        }
        this.setState({ filteredData: sortedData });
    }

    render() {
        const { filteredData, pageNo } = this.state;
        const dataForSplice = filteredData.concat();
        let k = 0;
        return (
            <div>
                <div id="titleId">
                    <span>Games List</span>
                </div>
                <div id="searchId">
                    <input type="text" id="searchInput" name="searchQuery" placeholder="Search" onChange={this.filterDataSet.bind(this)} />
                </div>
                <div className={'grid'}>
                    <table className={"table table-bordered"}>
                        <thead className={'tableHead'}>
                            <tr>
                                <td className={"headerLabel"}>
                                    <span>Rank</span>
                                </td>
                                <td className={"headerLabel"}>
                                    <span>Name</span>
                                </td>
                                <td className={"headerLabel"}>
                                    <span>Platform</span>
                                </td>
                                <td className={"headerLabel"}>
                                    <span>Genre</span>
                                </td>
                                <td className={"headerLabel"}>
                                    <span>Publisher</span>
                                </td>
                                <td className={"headerLabel"}>
                                    <span>Global Sales</span>
                                </td>
                                <td className={"headerLabel cursor_pointer"} onClick={() => this.sortData('year')}>
                                    <span>Year</span>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {dataForSplice.splice((pageNo - 1) * 20, 20).map(data => (
                                <tr key={k++}>
                                    <td>{data.rank}</td>
                                    <td>{data.name}</td>
                                    <td>{data.platform}</td>
                                    <td>{data.genre}</td>
                                    <td>{data.publisher}</td>
                                    <td>{data.global_sales}</td>
                                    <td>{data.year}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div id="paginationId">
                    Page <input id="pageNoId" type="number" defaultValue={pageNo} name="pageNo" onKeyDown={this.handleEnter.bind(this)} /> of {Math.ceil(filteredData.length / 20)}
                </div>
            </div>
        )
    }
}
