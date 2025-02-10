import React, { Component } from 'react'
import { withRuntimeContext } from 'vtex.render-runtime'
import { FormattedMessage } from 'react-intl'
import {
  Layout,
  PageBlock,
  PageHeader,
  ButtonWithIcon,
  IconDownload,
  IconUpload,
  IconHelp,
  IconClock,
  Table,
} from 'vtex.styleguide'

import './styles.global.css'
import { StorageInfo } from './interface/StorageData'
import { downloadFile } from './utils/Download'
import { generateXLSXFromData } from './utils/XLSXConverter'

interface AdminExampleState {
  storageInfos: StorageInfo[] | null
}

const schema = {
  properties: {
    id: {
      title: 'ID',
      width: 350,
    },
    date: {
      title: 'Date',
      width: 350,
    },
    progress: {
      title: 'Progress',
      width: 80,
      cellRenderer: ({ cellData }: { cellData: any }) => `${cellData}%`,
    },
  },
}

class AdminExample extends Component<Props, AdminExampleState> {
  constructor(props: any) {
    super(props)
    this.state = {
      storageInfos: null,
    }
  }

  downloadCSV = () => {
    const data = [
      {
        skuId: '000000',
        specificationId: '1111111',
        specificationName: 'DELETE THIS',
        specificationValue: 'DELETE THIS',
        isVisible: true,
      },
      {
        skuId: '000001',
        specificationId: '',
        specificationName: 'CREATE TEMAPLATE EXAMPLE DELETE THIS',
        specificationValue: 'DELETE THIS',
        isVisible: true,
      },
    ]
    const url = generateXLSXFromData(data)
    downloadFile(url, document, 'template.xlsx')
  }

  importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx'
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        const fileSizeInMB = file.size / 1024 / 1024
        if (fileSizeInMB > 10) {
          alert('File size is too big. Max size is 10MB')
          return
        }
        const formData = new FormData()
        formData.append('file', file)

        fetch('/_v/api/specifications', {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data)
          })
          .catch((error) => {
            console.error('Error uploading file:', error)
          })
      }
    }
    input.click()
  }

  refreshData = () => {
    fetch('/_v/api/specifications')
      .then((response) => response.json())
      .then((data: StorageInfo[]) => {
        this.setState({ storageInfos: data })
      })
      .catch((error) => {
        console.error('Error fetching status:', error)
        alert('Failed to fetch status')
      })
  }

  render() {
    const { storageInfos } = this.state
    const {
      runtime: { navigate },
    } = this.props

    return (
      <Layout
        pageHeader={
          <PageHeader
            title={<FormattedMessage id="specifications-app.hello-world" />}
          />
        }
      >
        <PageBlock variation="full">
          <h2>Export or import your unstructured specifications</h2>
          <hr style={{ border: '1px solid #e8e8e8', marginTop: '5vh' }} />

          <div
            style={{
              backgroundColor: '#ffcccc',
              padding: '1rem',
              borderRadius: '5px',
              color: '#cc0000',
            }}
          >
            <strong>Alert:</strong> If you want to create a new specification,
            make sure that the field "Specification ID" it's blank/ empty.
            Otherwise, make sure to{' '}
            <strong>
              {' '}
              fill the field "Specification ID" with the ID of the specification
              you want to update.{' '}
            </strong>
          </div>

          <h3 style={{ marginTop: '5vh' }}>Actions</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <ButtonWithIcon
              icon={<IconHelp />}
              variation="primary"
              onClick={this.downloadCSV}
            >
              Download template
            </ButtonWithIcon>

            <ButtonWithIcon
              icon={<IconDownload />}
              onClick={(_data: any) => {
                navigate({
                  page: 'admin.app.export',
                })
              }}
              variation="primary"
            >
              Export
            </ButtonWithIcon>

            <ButtonWithIcon
              icon={<IconUpload />}
              onClick={this.importData}
              variation="primary"
            >
              Import
            </ButtonWithIcon>

            <ButtonWithIcon
              icon={<IconClock />}
              onClick={this.refreshData}
              variation="primary"
            >
              Get Status
            </ButtonWithIcon>
          </div>

          {storageInfos && (
            <Table
              fullWidth
              schema={schema}
              items={storageInfos}
              density="high"
              onRowClick={(data: any) => {
                const rowData = data.rowData as StorageInfo
                navigate({
                  page: 'admin.app.details',
                  params: { id: rowData.id },
                })
              }}
            />
          )}
        </PageBlock>
      </Layout>
    )
  }
}

export default withRuntimeContext(AdminExample)
