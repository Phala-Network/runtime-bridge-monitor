import { AdaptedCheckbox } from 'baseui-final-form/checkbox'
import { AdaptedInput } from 'baseui-final-form/input'
import {
  BooleanColumn,
  NUMERICAL_FORMATS,
  NumericalColumn,
  StatefulDataTable,
  StringColumn,
} from 'baseui/data-table'
import { Button, KIND, SHAPE, SIZE } from 'baseui/button'
import { Card, StyledBody } from 'baseui/card'
import { Delete, Overflow, Plus } from 'baseui/icon'
import { FORM_ERROR } from 'final-form'
import { Field, Form } from 'react-final-form'
import { HeaderWrapper } from '../components/PageWrapper'
import { HeadingXLarge } from 'baseui/typography'
import {
  Modal,
  ModalBody,
  ModalButton,
  ModalFooter,
  ModalHeader,
} from 'baseui/modal'
import { KIND as NOTIFICATION_KIND, Notification } from 'baseui/notification'
import { queryManager } from '../utils/query'
import {
  updateAllLists,
  useUpdatedLists,
  useWorkerListWithStates,
  workers as workersAtom,
} from '../atoms/mgmt'
import { useAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { useStyletron } from 'baseui'
import { useUpdateAtom } from 'jotai/utils'
import BN from 'bn.js'
import Head from 'next/head'

const BN_1PHA = new BN('1000000000000')

const WorkerModalForm = ({ initValues, onSubmit, setModalClose }) => {
  const validate = useCallback((values) => {
    const ret = {}
    if (!(parseInt(values.pid) >= 1)) {
      ret.pid = 'PID should be >= 1.'
    }
    if (BN_1PHA.gte(new BN(values.stake))) {
      ret.stake = 'Stake amount be > 1000000000000(1PHA)'
    }
    if (!(values.name || '').trim()) {
      ret.name = 'Required.'
    }
    if (!(values.endpoint || '').trim()) {
      ret.endpoint = 'Required.'
    }

    return Object.keys(ret).length ? ret : undefined
  }, [])
  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initValues}
      validate={validate}
      render={({ handleSubmit, ...form }) => {
        return (
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Field
                name="pid"
                component={AdaptedInput}
                label="Pool PID"
                type="number"
                disabled={form.submitting}
                autoComplete="off"
              />
              <Field
                name="name"
                component={AdaptedInput}
                label="Name"
                disabled={form.submitting}
                autoComplete="off"
              />
              <Field
                name="stake"
                component={AdaptedInput}
                label="Stake Amount(BN string)"
                type="number"
                disabled={form.submitting}
                autoComplete="off"
              />
              <Field
                name="endpoint"
                component={AdaptedInput}
                label="pRuntime HTTP Endpoint"
                placeholder="http://path.to.endpoint"
                disabled={form.submitting}
                autoComplete="off"
              />
              <Field
                name="enabled"
                label="Enabled"
                component={AdaptedCheckbox}
                disabled={form.submitting}
              />
              {form.error && (
                <Notification
                  kind={NOTIFICATION_KIND.negative}
                  overrides={{
                    Body: { style: { width: 'auto' } },
                  }}
                >
                  {form.error}
                </Notification>
              )}
              {form.submitError && (
                <Notification
                  kind={NOTIFICATION_KIND.negative}
                  overrides={{
                    Body: { style: { width: 'auto' } },
                  }}
                >
                  Submitting failed:
                  <br />
                  {form.submitError}
                </Notification>
              )}
            </ModalBody>
            <ModalFooter>
              {form.submitting ? (
                <>Loading...</>
              ) : (
                <>
                  <ModalButton kind={KIND.tertiary} onClick={setModalClose}>
                    Cancel
                  </ModalButton>
                  <ModalButton type="submit">Save</ModalButton>
                </>
              )}
            </ModalFooter>
          </form>
        )
      }}
    />
  )
}

const WorkerRowEditModal = ({ currentRow, clearCurrentRow }) => {
  const modalOpen = useMemo(() => !!currentRow, [currentRow])
  const updateLists = useUpdateAtom(updateAllLists)
  const initValues = useMemo(
    () => (currentRow ? currentRow.data : {}),
    [currentRow]
  )
  const submit = useCallback(
    async (values) => {
      try {
        const { lifecycleManagerStateUpdate } = await queryManager({
          queryKey: [
            {
              requestUpdateWorker: {
                items: [
                  {
                    id: { uuid: currentRow.data.uuid },
                    worker: values,
                  },
                ],
              },
            },
          ],
        })
        updateLists({
          pools: lifecycleManagerStateUpdate.pools || [],
          workers: lifecycleManagerStateUpdate.workers || [],
        })
        clearCurrentRow()
        return {}
      } catch (e) {
        if (e.isProtoError) {
          return {
            [FORM_ERROR]: e.extra,
          }
        }
        return {
          [FORM_ERROR]: e,
        }
      }
    },
    [currentRow]
  )
  return (
    <Modal
      onClose={clearCurrentRow}
      isOpen={modalOpen}
      unstable_ModalBackdropScroll={true}
      closeable={false}
    >
      <ModalHeader>Edit Worker</ModalHeader>
      <WorkerModalForm
        setModalClose={clearCurrentRow}
        initValues={initValues}
        onSubmit={submit}
      />
    </Modal>
  )
}

const CreateWorkerModalWithButton = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const updateLists = useUpdateAtom(updateAllLists)

  const submit = useCallback(
    async (values) => {
      try {
        const { lifecycleManagerStateUpdate } = await queryManager({
          queryKey: [
            {
              requestCreateWorker: {
                workers: [values],
              },
            },
          ],
        })
        updateLists({
          pools: lifecycleManagerStateUpdate.pools || [],
          workers: lifecycleManagerStateUpdate.workers || [],
        })
        setModalOpen(false)
        return {}
      } catch (e) {
        if (e.isProtoError) {
          return {
            [FORM_ERROR]: e.extra,
          }
        }
        return {
          [FORM_ERROR]: e,
        }
      }
    },
    [updateLists]
  )

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        shape={SHAPE.pill}
        size={SIZE.compact}
        overrides={{
          Root: {
            style: {
              height: '36px',
            },
          },
        }}
      >
        <Plus />
        Add
      </Button>
      <Modal
        onClose={() => setModalOpen(false)}
        isOpen={modalOpen}
        unstable_ModalBackdropScroll={true}
        closeable={false}
      >
        <ModalHeader>Add Worker</ModalHeader>
        <WorkerModalForm
          setModalClose={() => setModalOpen(false)}
          initValues={{ enabled: true }}
          onSubmit={submit}
        />
      </Modal>
    </>
  )
}

const listColumn = [
  StringColumn({
    title: 'Name',
    mapDataToValue: (data) => data.name || '',
    lineClamp: 3,
  }),
  NumericalColumn({
    title: 'PID',
    format: NUMERICAL_FORMATS.DEFAULT,
    mapDataToValue: (data) => parseInt(data.pid) || 0,
  }),
  StringColumn({
    title: 'Status',
    mapDataToValue: (data) => data.status || '',
    lineClamp: 3,
  }),
  StringColumn({
    title: 'Last Message',
    mapDataToValue: (data) => data.lastMessage || '',
    lineClamp: 3,
  }),
  NumericalColumn({
    title: 'Block Height',
    format: NUMERICAL_FORMATS.DEFAULT,
    mapDataToValue: (data) => parseInt(data.paraBlockDispatchedTo || 0),
  }),
  StringColumn({
    title: 'Public Key',
    mapDataToValue: (data) => '0x' + (data.publicKey || ''),
    lineClamp: 3,
  }),
  StringColumn({
    title: 'Miner Status',
    mapDataToValue: (data) => data.minerInfoJson || '',
    lineClamp: 3,
  }),
  StringColumn({
    title: 'Miner Account',
    mapDataToValue: (data) => data.minerAccountId || '',
    lineClamp: 3,
  }),
  StringColumn({
    title: 'Stake Amount(BN)',
    mapDataToValue: (data) => data.stake || 0,
    lineClamp: 3,
  }),
  StringColumn({
    title: 'UUID',
    mapDataToValue: (data) => data.uuid || '',
    lineClamp: 3,
  }),
  NumericalColumn({
    title: 'parentHeaderSynchedTo',
    format: NUMERICAL_FORMATS.DEFAULT,
    mapDataToValue: (data) => parseInt(data.parentHeaderSynchedTo || 0),
  }),
  NumericalColumn({
    title: 'paraHeaderSynchedTo',
    format: NUMERICAL_FORMATS.DEFAULT,
    mapDataToValue: (data) => parseInt(data.paraHeaderSynchedTo || 0),
  }),
  BooleanColumn({
    title: 'Initialized',
    mapDataToValue: (data) => !!data.initialized,
  }),
  StringColumn({
    title: 'Endpoint',
    mapDataToValue: (data) => data.endpoint || '',
    lineClamp: 3,
  }),
  BooleanColumn({
    title: 'Enabled',
    mapDataToValue: (data) => !!data.enabled,
  }),
]

const WorkersList = ({ workers }) => {
  const [currentRow, setCurrentRow] = useState(null)
  const [css] = useStyletron()
  const updateLists = useUpdateAtom(updateAllLists)
  const rows = useWorkerListWithStates(workers)

  const deleteRow = useCallback(
    async ({ row }) => {
      if (!window.confirm(`Delete worker #${row.data.uuid}?`)) {
        return
      }
      const { lifecycleManagerStateUpdate } = await queryManager({
        queryKey: [
          {
            requestUpdateWorker: {
              items: [
                {
                  id: { uuid: row.data.uuid },
                  worker: {
                    ...row.data,
                    deleted: true,
                  },
                },
              ],
            },
          },
        ],
      })
      window.alert('Success!')
      updateLists({
        pools: lifecycleManagerStateUpdate.pools || [],
        workers: lifecycleManagerStateUpdate.workers || [],
      })
    },
    [updateLists]
  )
  const rowActions = useMemo(
    () => [
      {
        label: 'Delete',
        onClick: deleteRow,
        renderIcon: ({ size }) => <Delete size={size} />,
      },
      {
        label: 'Edit',
        onClick: ({ row }) => setCurrentRow(row),
        renderIcon: ({ size }) => <Overflow size={size} />,
      },
    ],
    [deleteRow, setCurrentRow]
  )

  return (
    <>
      <div className={css({ height: 'calc(100vh - 270px)' })}>
        <StatefulDataTable
          columns={listColumn}
          rows={rows}
          rowActions={rowActions}
          resizableColumnWidths
          rowHeight={78}
        />
      </div>
      <WorkerRowEditModal
        currentRow={currentRow}
        clearCurrentRow={() => setCurrentRow(null)}
      />
    </>
  )
}

const WorkersPage = () => {
  const [workers] = useAtom(workersAtom)
  useUpdatedLists()
  return (
    <div>
      <Head>
        <title>Workers</title>
      </Head>
      <HeaderWrapper>
        <HeadingXLarge marginRight={'auto'}>Workers</HeadingXLarge>
        <CreateWorkerModalWithButton />
      </HeaderWrapper>
      <div style={{ margin: '0 42px' }}>
        <Card overrides={{ Root: { style: { width: '100%' } } }}>
          {workers.length ? (
            <WorkersList workers={workers} />
          ) : (
            <StyledBody>🈳️ Nothing found here.</StyledBody>
          )}
        </Card>
      </div>
    </div>
  )
}

export default WorkersPage
