import { AdaptedCheckbox } from 'baseui-final-form/checkbox'
import { AdaptedInput } from 'baseui-final-form/input'
import { Block } from 'baseui/block'
import {
  BooleanColumn,
  CategoricalColumn,
  CustomColumn,
  NUMERICAL_FORMATS,
  NumericalColumn,
  StatefulDataTable,
  StringColumn,
} from 'baseui/data-table'
import { Card, StyledBody } from 'baseui/card'
import { FORM_ERROR } from 'final-form'
import { Field, Form } from 'react-final-form'
import { HeaderWrapper } from '../../components/PageWrapper'
import { HeadingXLarge } from 'baseui/typography'
import { KIND } from 'baseui/button'
import {
  Modal,
  ModalBody,
  ModalButton,
  ModalFooter,
  ModalHeader,
} from 'baseui/modal'
import { KIND as NOTIFICATION_KIND, Notification } from 'baseui/notification'
import { PLACEMENT, StatefulTooltip, TRIGGER_TYPE } from 'baseui/tooltip'
import BN from '../../../node_modules/bn.js/lib/bn'

import { queryManager, queryProxy } from '../../utils/query'
import { useCallback, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { useStyletron } from 'baseui'
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

const listColumn = [
  StringColumn({
    title: 'Name',
    mapDataToValue: (data) => data.name || '',
  }),
  NumericalColumn({
    title: 'PID',
    mapDataToValue: (data) => parseInt(data.pid) || 0,
  }),
  CategoricalColumn({
    title: 'Status',
    mapDataToValue: (data) => data.status || 'LOADING',
  }),
  CustomColumn({
    title: 'Last Message',
    mapDataToValue: (data) => data.lastMessage || '',
    minWidth: 500,
    maxWidth: 500,
    renderCell: ({ value }) => (
      <StatefulTooltip
        placement={PLACEMENT.top}
        dismissOnEsc={false}
        dismissOnClickOutside={false}
        triggerType={TRIGGER_TYPE.hover}
        content={() => (
          <Block maxWidth="60vw" height="auto">
            <p>{value}</p>
          </Block>
        )}
      >
        {value.substring(0, 72)}
      </StatefulTooltip>
    ),
  }),
  NumericalColumn({
    title: 'Block Height',
    mapDataToValue: (data) => parseInt(data.paraBlockDispatchedTo || 0),
  }),
  StringColumn({
    title: 'Public Key',
    mapDataToValue: (data) => '0x' + (data.publicKey || ''),
  }),
  CategoricalColumn({
    title: 'State',
    mapDataToValue: (data) => data.minerInfo?.state || 'Unknown',
  }),
  NumericalColumn({
    title: 'V',
    precision: 2,
    mapDataToValue: (data) => parseFloat(data.minerInfo?.v) || 0,
  }),
  NumericalColumn({
    title: 'Ve',
    precision: 2,
    mapDataToValue: (data) => parseFloat(data.minerInfo?.ve) || 0,
  }),
  NumericalColumn({
    title: 'pInit',
    mapDataToValue: (data) =>
      parseInt(data.minerInfo?.raw?.benchmark?.pInit) || 0,
  }),
  NumericalColumn({
    title: 'pInstant',
    mapDataToValue: (data) =>
      parseInt(data.minerInfo?.raw?.benchmark?.pInstant) || 0,
  }),
  StringColumn({
    title: 'Minted',
    mapDataToValue: (data) => data.minerInfo?.stats?.totalReward || '0',
  }),

  StringColumn({
    title: 'Miner Account',
    mapDataToValue: (data) => data.minerAccountId || '',
  }),
  StringColumn({
    title: 'Stake Amount(BN)',
    mapDataToValue: (data) => data.stake || 0,
  }),
  StringColumn({
    title: 'UUID',
    mapDataToValue: (data) => data.uuid || '',
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
  CustomColumn({
    title: 'Miner Info',
    mapDataToValue: (data) => data.minerInfoJson || '',
    minWidth: 90,
    maxWidth: 90,
    renderCell: ({ value }) => (
      <StatefulTooltip
        placement={PLACEMENT.top}
        dismissOnEsc={false}
        dismissOnClickOutside={false}
        triggerType={TRIGGER_TYPE.hover}
        content={() => (
          <Block maxWidth="60vw" height="auto">
            <pre>{value}</pre>
          </Block>
        )}
      >
        Hover
      </StatefulTooltip>
    ),
  }),
  BooleanColumn({
    title: 'Initialized',
    mapDataToValue: (data) => !!data.initialized,
  }),
  StringColumn({
    title: 'Endpoint',
    mapDataToValue: (data) => data.endpoint || '',
  }),
  BooleanColumn({
    title: 'Enabled',
    mapDataToValue: (data) => !!data.enabled,
  }),
]

const WorkersList = ({ workers }) => {
  const [currentRow, setCurrentRow] = useState(null)
  const [css] = useStyletron()
  const router = useRouter()
  const { id } = router.query

  const deleteRow = useCallback(
    async ({ row }) => {
      if (!window.confirm(`Delete worker #${row.data.uuid}?`)) {
        return
      }
      const { hasError, error } = await queryProxy(id, 'UpdateWorker', {
        items: [
          {
            id: { uuid: row.data.uuid },
            pool: {
              deleted: true,
            },
          },
        ],
      })

      if (hasError) {
        console.error(error)
      }

      window.alert(hasError ? error.toString() : 'Success!')
    },
    [workers]
  )
  const killRow = useCallback(
    async ({ row }) => {
      if (!window.confirm(`Kill worker #${row.data.uuid}?`)) {
        return
      }
      const { hasError, error } = await queryProxy(id, 'KillWorker', {
        ids: [row.data.uuid],
      })

      if (hasError) {
        console.error(error)
      }

      window.alert(hasError ? error.toString() : 'Success!')
    },
    [workers]
  )
  const restartRow = useCallback(
    async ({ row }) => {
      if (!window.confirm(`Restart worker #${row.data.uuid}?`)) {
        return
      }

      const { hasError, error } = await queryProxy(id, 'RestartWorker', {
        ids: [row.data.uuid],
      })

      if (hasError) {
        console.error(error)
      }

      window.alert(hasError ? error.toString() : 'Success!')
    },
    [workers]
  )
  const rowActions = useMemo(
    () => [
      {
        label: 'Kill',
        onClick: killRow,
        renderIcon: () => <p>Kill</p>,
      },
      {
        label: 'Restart',
        onClick: restartRow,
        renderIcon: () => <p>Restart</p>,
      },
      {
        label: 'Delete',
        onClick: deleteRow,
        renderIcon: () => <p>Delete</p>,
      },
      {
        label: 'Edit',
        onClick: ({ row }) => setCurrentRow(row),
        renderIcon: () => <p>Edit</p>,
      },
    ],
    [killRow, restartRow, deleteRow, setCurrentRow]
  )

  const rows = useMemo(
    () =>
      workers.map((i) => ({
        id: i.worker.uuid,
        data: Object.assign(i, {
          ...i.worker,
          minerInfo: JSON.parse(i.minerInfoJson || '{}'),
        }),
      })),
    [workers]
  )

  return (
    <>
      <div className={css({ height: 'calc(100vh - 300px)' })}>
        <StatefulDataTable
          columns={listColumn}
          rows={rows}
          rowActions={rowActions}
          resizableColumnWidths
        />
      </div>
      <p>Total: {workers.length}</p>

      <WorkerRowEditModal
        currentRow={currentRow}
        clearCurrentRow={() => setCurrentRow(null)}
      />
    </>
  )
}

const WorkerRowEditModal = ({ currentRow, clearCurrentRow }) => {
  const modalOpen = useMemo(() => !!currentRow, [currentRow])
  const initValues = useMemo(
    () => (currentRow ? currentRow.data : {}),
    [currentRow]
  )

  const router = useRouter()
  const { id } = router.query
  const submit = useCallback(
    async (values) => {
      try {
        const { hasError, error } = await queryProxy(id, 'UpdateWorker', {
          items: [
            {
              id: {
                uuid: currentRow.data.uuid,
              },
              worker: values,
            },
          ],
        })

        if (hasError) {
          console.error(error)
        }

        window.alert(hasError ? error.toString() : 'Success!')

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
    [currentRow, id]
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

const WorkerPage = () => {
  const router = useRouter()
  const { id } = router.query

  // const { data: workerList } = useQuery(
  //   id,
  //   () => fetch(`/ptp/proxy/${id}/ListWorker`).then((res) => res.json()),
  //   { refetchInterval: 3000 }
  // )

  const { data: workerStatus } = useQuery(
    id,
    () => queryProxy(id, 'GetWorkerStatus', {}),
    { refetchInterval: 3000 }
  )
  //

  const workers = workerStatus?.data?.workerStates || []
  // const workers = useMemo(() => {
  //   console.log(workerList?.data?.workers, workerStatus?.data?.workers)
  //   return []
  // }, [workerList, workerStatus])

  return (
    <div>
      <Head>
        <title>Workers</title>
      </Head>
      <HeaderWrapper>
        <HeadingXLarge marginRight={'auto'}>Workers</HeadingXLarge>
        {/*<CreateWorkerModalWithButton />*/}
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

export default WorkerPage
