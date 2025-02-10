import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageBlock,
  PageHeader,
  Spinner,
  ButtonWithIcon,
  IconCaretLeft,
  Table,
} from 'vtex.styleguide'

import './styles.global.css'
import {
  StorageDataInternal,
  StorageDataReceived,
} from './interface/StorageData'
import { withRuntimeContext } from 'vtex.render-runtime'

interface State {
  data: StorageDataInternal | null
  loading: boolean
  tableLength: number
  currentPage: number
  slicedData: any[]
  currentItemFrom: number
  currentItemTo: number
  itemsLength: number
  emptyStateLabel: string
}

const schema = {
  properties: {
    skuId: {
      title: 'SKU ID',
      width: 100,
    },
    name: {
      title: 'Specification Name',
      width: 200,
    },
    value: {
      title: 'Specification Value',
      width: 200,
    },
    isVisible: {
      title: 'Specification is visible',
      width: 200,
      cellRenderer: ({ cellData }: { cellData: boolean }) =>
        cellData ? 'Yes' : 'No',
    },
    error: {
      title: 'Error Message',
      width: 600,
    },
  },
}

const tableLength = 5

class AdminExampleDetail extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      data: null,
      loading: true,
      tableLength,
      currentPage: 1,
      slicedData: [],
      currentItemFrom: 1,
      currentItemTo: tableLength,
      itemsLength: 0,
      emptyStateLabel: 'Nothing to show.',
    }

    this.handleNextClick = this.handleNextClick.bind(this)
    this.handlePrevClick = this.handlePrevClick.bind(this)
    this.goToPage = this.goToPage.bind(this)
    this.handleRowsChange = this.handleRowsChange.bind(this)
  }

  async componentDidMount() {
    await this.fetchData()
  }

  async componentDidUpdate(prevProps: Props) {
    if (prevProps.params.id !== this.props.params.id) {
      await this.fetchData()
    }
  }

  fetchData = async () => {
    try {
      const response = await fetch(
        `/_v/api/specifications/details/${this.props.params.id}`
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const result: StorageDataReceived = await response.json()
      console.log(result.results)
      this.setState({
        data: {
          caller: result.caller,
          progress: result.progress,
          rows: result.results,
        },
        itemsLength: result.results.length,
        slicedData: result.results.slice(0, this.state.tableLength),
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      this.setState({ loading: false })
    }
  }

  handleNextClick() {
    const newPage = Number(this.state.currentPage) + 1
    const itemFrom = Number(this.state.currentItemTo) + 1
    const itemTo = Number(this.state.tableLength) * newPage
    const data = this.state.data?.rows.slice(itemFrom - 1, itemTo) || []
    this.goToPage(newPage, itemFrom, itemTo, data)
  }

  handlePrevClick() {
    if (this.state.currentPage === 1) return
    const newPage = Number(this.state.currentPage) - 1
    const itemFrom =
      Number(this.state.currentItemFrom) - Number(this.state.tableLength)
    const itemTo = Number(this.state.currentItemFrom) - 1
    const data = this.state.data?.rows.slice(itemFrom - 1, itemTo) || []
    this.goToPage(newPage, itemFrom, itemTo, data)
  }

  goToPage(
    currentPage: number,
    currentItemFrom: number,
    currentItemTo: number,
    slicedData: any[]
  ) {
    this.setState({
      currentPage,
      currentItemFrom,
      currentItemTo,
      slicedData,
    })
  }

  handleRowsChange(_e: React.ChangeEvent<HTMLInputElement>, value: number) {
    this.setState(
      {
        tableLength: value,
        currentItemTo: value,
      },
      () => {
        const data = this.state.data?.rows.slice(0, value) || []
        this.goToPage(1, 1, value, data)
      }
    )
  }

  render() {
    const { data, loading } = this.state
    const {
      runtime: { navigate },
    } = this.props

    return (
      <Layout
        pageHeader={
          <PageHeader
            title={<FormattedMessage id="specifications-app.details" />}
          />
        }
      >
        <PageBlock variation="full">
          <ButtonWithIcon
            icon={<IconCaretLeft />}
            onClick={() =>
              navigate({
                page: 'admin.app.main',
              })
            }
            variation="tertiary"
          >
            Back
          </ButtonWithIcon>

          {loading ? (
            <Spinner />
          ) : (
            <div>
              <h3>Response Data:</h3>
              {data ? (
                <div>
                  <strong>Caller:</strong> {data.caller}
                  <br />
                  <strong>Progress:</strong> {data.progress}%
                  <br />
                  <br />
                  <strong>Results:</strong>
                  <br />
                  <Table
                    fullWidth
                    schema={schema}
                    items={this.state.slicedData}
                    density="high"
                    dynamicRowHeight={true}
                    pagination={{
                      onNextClick: this.handleNextClick,
                      onPrevClick: this.handlePrevClick,
                      currentItemFrom: this.state.currentItemFrom,
                      currentItemTo: this.state.currentItemTo,
                      onRowsChange: this.handleRowsChange,
                      textShowRows: 'Show rows',
                      textOf: 'of',
                      totalItems: this.state.itemsLength,
                      rowsOptions: [5, 10, 15, 25],
                    }}
                  />
                </div>
              ) : (
                <div>No data available</div>
              )}
            </div>
          )}
        </PageBlock>
      </Layout>
    )
  }
}

export default withRuntimeContext(AdminExampleDetail)
