import React, { Component } from 'react'
import {
  Layout,
  PageBlock,
  PageHeader,
  ButtonWithIcon,
  IconCaretLeft,
  EXPERIMENTAL_Select,
  IconDownload,
} from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'
import { withRuntimeContext } from 'vtex.render-runtime'
import { downloadFile } from './utils/Download'
import { generateXLSXFromData } from './utils/XLSXConverter'

interface ExportPageState {
  options: Brand[]
  selectedOption: string
}

class ExportPage extends Component<Props, ExportPageState> {
  constructor(props: Props) {
    super(props)
    this.state = {
      options: [],
      selectedOption: '',
    }
  }

  componentDidMount() {
    this.fetchOptions()
  }

  fetchOptions = async () => {
    try {
      const response = await fetch(`/_v/api/specifications/brands`)
      const data = await response.json()
      this.setState({ options: data })
    } catch (error) {
      console.error('Error fetching brands:', error)
      alert('Failed to fetch data')
    }
  }

  handleExport = async () => {
    const { selectedOption } = this.state
    try {
      const response = await fetch(
        `/_v/api/specifications/report/${selectedOption}`
      )
      const data: SpecificationExport[] = await response.json()

      const url = generateXLSXFromData(data)
      downloadFile(url, document, 'export.xlsx')
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  handleOptionChange = (data: any) => {
    this.setState({ selectedOption: data.value })
  }

  render() {
    const { options, selectedOption } = this.state
    const {
      runtime: { navigate },
    } = this.props

    return (
      <Layout
        pageHeader={
          <PageHeader
            title={<FormattedMessage id="specifications-app.export" />}
          />
        }
      >
        <PageBlock variation="full">
          <div style={{ marginBottom: '6vh' }}>
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
          </div>
          <div style={{ marginBottom: '6vh' }}>
            <EXPERIMENTAL_Select
              label="Select the brand"
              options={options.map((option) => ({
                value: option.id.toString(),
                label: option.name,
              }))}
              multi={false}
              clearable={false}
              onChange={this.handleOptionChange}
            />
          </div>
          <div>
            <ButtonWithIcon
              icon={<IconDownload />}
              onClick={this.handleExport}
              variation="primary"
              disabled={!selectedOption}
            >
              Save
            </ButtonWithIcon>
          </div>
        </PageBlock>
      </Layout>
    )
  }
}

export default withRuntimeContext(ExportPage)
