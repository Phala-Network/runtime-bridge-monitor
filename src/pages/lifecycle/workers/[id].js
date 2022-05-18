import {
  Badge,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Stack,
  Toast,
  ToastContainer,
} from 'react-bootstrap'
import {
  DataType,
  EditingMode,
  FilteringMode,
  PagingPosition,
  SortingMode,
} from 'ka-table/enums'
import { Table, kaReducer } from 'ka-table'
import {
  deselectAllRows,
  deselectRow,
  selectRow,
} from 'ka-table/actionCreators'
import { useFormik } from 'formik'
import { usePeer } from '../../../utils/peer_list'
import dynamic from 'next/dynamic'
import * as Yup from 'yup'

import { queryProxy } from '../../../utils/query'
import { useCallback, useState } from 'react'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import PageWrapper, { PageStatusOverlay } from '../../../components/PageWrapper'

const LifecycleManagerWorkersPageWrapper = ({ children }) => {
  const router = useRouter()
  const { id } = router.query
  const peer = usePeer(id)

  return (
    <PageWrapper
      title={peer ? `[${peer.hostname}] Workers` : `Workers`}
      showLifecycleLinks
    >
      <Container fluid={true}>{children}</Container>
    </PageWrapper>
  )
}

const LifecycleManagerWorkersData = ({ workers }) => {
  return (
    <>
      <Row>
        <Container fluid={true}>
          <DataTable workers={workers} />
        </Container>
      </Row>
    </>
  )
}

const EditModal = ({ title, onHide, initValue }) => {
  const router = useRouter()
  const { id } = router.query

  const form = useFormik({
    initialValues: initValue
      ? {
          pid: initValue.pid,
          name: initValue.name,
          endpoint: initValue.endpoint,
          stake: initValue.stake,
          enabled: initValue.enabled,
          syncOnly: initValue.syncOnly,
        }
      : {
          pid: '',
          name: '',
          endpoint: '',
          stake: '',
          enabled: true,
          syncOnly: false,
        },
    validationSchema: Yup.object({
      pid: Yup.number().required('Required.'),
      name: Yup.string().trim().required('Required.'),
      endpoint: Yup.string().trim().required('Required.'),
      stake: Yup.string().trim().required('Required.'),
    }),
    onSubmit: async (values) => {
      const item = {
        pid: parseInt(values.pid),
        name: values.name.trim(),
        endpoint: values.endpoint.trim(),
        stake: values.stake.trim(),
        enabled: values.enabled,
        syncOnly: values.syncOnly,
      }

      setLoading(true)
      try {
        const { hasError, error } = await queryProxy(
          id,
          initValue ? 'UpdateWorker' : 'CreateWorker',
          initValue
            ? {
                items: [
                  {
                    id: {
                      uuid: initValue.uuid,
                    },
                    worker: item,
                  },
                ],
              }
            : {
                workers: [item],
              }
        )
        if (hasError) {
          alert(JSON.stringify(error, null, 2))
          console.error(error)
          setLoading(false)
        } else {
          setLoading(false)
          onHide()
        }
      } catch (e) {
        alert(e instanceof Error ? e.toString() : JSON.stringify(e, null, 2))
        console.error(e)
        setLoading(false)
      }
    },
  })

  const [loading, setLoading] = useState(false)

  return (
    <Modal show={true} animation={false} onHide={onHide}>
      <PageStatusOverlay isLoading={loading} />
      <Modal.Header closeButton>
        <Stack gap={0}>
          <Modal.Title>{title}</Modal.Title>
          {!!initValue?.uuid && (
            <Modal.Title as="p">{initValue.uuid}</Modal.Title>
          )}
        </Stack>
      </Modal.Header>
      <Form onSubmit={form.handleSubmit}>
        <Modal.Body>
          <Stack gap={2}>
            <Form.Group controlId="enabled" className="position-relative">
              <Form.Check
                type="switch"
                id="enabled"
                label="Enable Worker"
                onChange={form.handleChange}
                checked={form.values.enabled}
              />
            </Form.Group>
            <Form.Group controlId="enabled" className="position-relative">
              <Form.Check
                type="switch"
                id="syncOnly"
                label="Sync Only(Override Pool)"
                onChange={form.handleChange}
                checked={form.values.syncOnly}
              />
            </Form.Group>
            <Form.Group controlId="pid" className="position-relative">
              <Form.Label>PID</Form.Label>
              <Form.Control
                type="number"
                name="pid"
                {...form.getFieldProps('pid')}
                isInvalid={form.errors.pid && form.touched.pid}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {form.errors.pid}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="name" className="position-relative">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                {...form.getFieldProps('name')}
                isInvalid={form.errors.name && form.touched.name}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {form.errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="endpoint" className="position-relative">
              <Form.Label>pRuntime Endpoint</Form.Label>
              <Form.Control
                type="text"
                name="endpoint"
                {...form.getFieldProps('endpoint')}
                isInvalid={form.errors.endpoint && form.touched.endpoint}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {form.errors.endpoint}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="stake" className="position-relative">
              <Form.Label>Stake(BN)</Form.Label>
              <Form.Control
                type="text"
                name="stake"
                {...form.getFieldProps('stake')}
                isInvalid={form.errors.stake && form.touched.stake}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {form.errors.stake}
              </Form.Control.Feedback>
            </Form.Group>
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

const tablePropsInit = {
  columns: [
    {
      key: 'name',
      title: 'Name',
      width: 100,
      dataType: DataType.String,
      inlineCode: true,
    },
    {
      key: 'pid',
      title: 'PID',
      width: 80,
      dataType: DataType.Number,
      inlineCode: true,
    },
    {
      key: 'endpoint',
      title: 'pRuntime Endpoint',
      width: 360,
      dataType: DataType.String,
      inlineCode: true,
    },
    {
      key: 'stake',
      title: 'Stake(BN)',
      width: 200,
      dataType: DataType.String,
      inlineCode: true,
    },
    {
      key: 'uuid',
      title: 'ID',
      width: 260,
      dataType: DataType.String,
      inlineCode: true,
    },
    {
      key: 'syncOnly',
      title: 'Sync Only',
      width: 100,
      dataType: DataType.Boolean,
    },
    {
      key: 'enabled',
      title: 'Enabled',
      width: 100,
      dataType: DataType.Boolean,
    },
  ],
  rowKeyField: 'uuid',
  sortingMode: SortingMode.Single,
  editingMode: EditingMode.None,
  filteringMode: FilteringMode.FilterRow,
  columnResizing: true,
  childComponents: {
    noDataRow: {
      content: () => 'No Data Found',
    },
    tableFoot: {
      content: (props) => {
        const { selectedRows, dispatch } = props

        const router = useRouter()
        const { id } = router.query

        const [modalShow, setModalShow] = useState(false)
        const [currentRow, setCurrentRow] = useState(null)

        const resetForm = useCallback(() => {
          setModalShow(false)
          setCurrentRow(false)
        }, [setModalShow, setCurrentRow])

        const setAddForm = useCallback(() => {
          setCurrentRow(null)
          setModalShow(true)
        }, [setCurrentRow, setModalShow])

        const setEditForm = useCallback(
          (uuid, props) => {
            setCurrentRow(
              Object.assign(
                {},
                props.data.find((i) => i.uuid === uuid)
              )
            )
            setModalShow(true)
          },
          [setCurrentRow, setModalShow]
        )

        const deleteRow = useCallback(async () => {
          if (!window.confirm(`Delete selected workers?`)) {
            return
          }
          const { hasError, error } = await queryProxy(id, 'UpdateWorker', {
            items: selectedRows.map((i) => ({
              id: {
                uuid: i,
              },
              worker: {
                deleted: true,
              },
            })),
          })

          if (hasError) {
            console.error(error)
          } else {
            dispatch(deselectAllRows())
          }

          window.alert(hasError ? error.toString() : 'Success!')
        }, [selectedRows])

        return (
          <>
            {modalShow && (
              <EditModal
                initValue={currentRow}
                onHide={() => resetForm()}
                title={currentRow ? 'Edit Item' : 'Add Item'}
              />
            )}
            <ToastContainer
              position="bottom-end"
              className="p-3 position-fixed"
            >
              {selectedRows.length === 1 && (
                <Toast>
                  <Toast.Header closeButton={false}>
                    {selectedRows[0]}
                  </Toast.Header>
                  <Toast.Body>
                    <Stack gap={2}>
                      <ButtonGroup>
                        <Button
                          variant="primary"
                          onClick={() => setEditForm(selectedRows[0], props)}
                        >
                          Edit
                        </Button>
                      </ButtonGroup>
                    </Stack>
                  </Toast.Body>
                </Toast>
              )}
              <Toast>
                <Toast.Header closeButton={false}>
                  Selected: {selectedRows.length}
                </Toast.Header>
                <Toast.Body>
                  <Stack gap={2}>
                    {!!selectedRows.length && (
                      <ButtonGroup>
                        <Button variant="danger" onClick={() => deleteRow()}>
                          Delete
                        </Button>
                      </ButtonGroup>
                    )}
                    <ButtonGroup>
                      <Button variant="success" onClick={() => setAddForm()}>
                        Add
                      </Button>
                    </ButtonGroup>
                    <ButtonGroup>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          props.data.forEach((i) => {
                            if (selectedRows.includes(i.uuid)) {
                              return
                            }
                            dispatch(selectRow(i.uuid))
                          })
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => dispatch(deselectAllRows())}
                      >
                        Deselect All
                      </Button>
                    </ButtonGroup>
                  </Stack>
                </Toast.Body>
              </Toast>
            </ToastContainer>
          </>
        )
      },
    },
    dataRow: {
      elementAttributes: () => ({
        onClick: (event, extendedEvent) => {
          extendedEvent.dispatch(
            extendedEvent.childProps.selectedRows.includes(
              extendedEvent.childProps.rowKeyValue
            )
              ? deselectRow(extendedEvent.childProps.rowKeyValue)
              : selectRow(extendedEvent.childProps.rowKeyValue)
          )
        },
      }),
    },
  },
  paging: {
    enabled: true,
    pageIndex: 0,
    pageSize: 100,
    pageSizes: [50, 100, 300, 500],
    position: PagingPosition.Bottom,
  },
  format: ({ column, value }) => {
    if (column.inlineCode === true) {
      return <code>{value}</code>
    }
    if (column.dataType === DataType.Boolean) {
      return value ? 'Yes' : 'No'
    }
  },
  selectedRows: [],
}

const _DataTable = ({ workers }) => {
  const [tableProps, changeTableProps] = useState(tablePropsInit)
  const dispatch = (action) => {
    changeTableProps((prevState) => kaReducer(prevState, action))
  }

  return (
    <>
      <Table data={workers} {...tableProps} dispatch={dispatch} />
      <p style={{ height: '320px' }} />
    </>
  )
}

const DataTable = dynamic(() => Promise.resolve(_DataTable), { ssr: false })

const LifecycleManagerWorkersPage = () => {
  const router = useRouter()
  const { id } = router.query

  const { isLoading, error, data } = useQuery(
    id,
    () => queryProxy(id, 'ListWorker', {}),
    { refetchInterval: 3000 }
  )

  const workers = data?.data?.workers || []

  return (
    <LifecycleManagerWorkersPageWrapper>
      <Stack gap={2}>
        <Container>
          <Row>
            <Col md="auto">
              <h4>Workers</h4>
            </Col>
            <Col>
              <Stack
                gap={2}
                direction="horizontal"
                className="mt-1 overflow-auto"
              >
                <Badge bg="secondary">
                  <small>{id}</small>
                </Badge>
                <Badge bg="secondary">
                  <small>Total count: {workers.length}</small>
                </Badge>
              </Stack>
            </Col>
          </Row>
        </Container>
        <LifecycleManagerWorkersData workers={workers} />
      </Stack>
      <PageStatusOverlay
        error={data?.hasError ? data : error}
        isLoading={isLoading}
      />
    </LifecycleManagerWorkersPageWrapper>
  )
}

export default LifecycleManagerWorkersPage
