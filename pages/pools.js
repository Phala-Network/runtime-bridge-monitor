import { ALIGNMENT, Grid } from 'baseui/layout-grid'
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
import { Combobox } from 'baseui/combobox'
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
import {
  currentNs,
  nsList,
  pools as poolsAtom,
  setNs,
  updateAllLists,
  useUpdatedLists,
} from '../atoms/mgmt'
import { queryManager } from '../utils/query'
import { useAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useMemo, useState } from 'react'
import { useStyletron } from 'baseui'
import Head from 'next/head'

const PoolModalForm = ({ initValues, onSubmit, setModalClose }) => {
  const validate = useCallback((values) => {
    const ret = {}
    if (!(parseInt(values.pid) >= 1)) {
      ret.pid = 'PID should be >= 1.'
    }
    if (!(values.name || '').trim()) {
      ret.name = 'Required.'
    }
    if (
      !((values.mnemonic || '').trim() || (values.polkadotJson || '').trim())
    ) {
      ret[FORM_ERROR] = 'Either mnemonic nor Polkadot JSON not inputted.'
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
                label="PID"
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
                name="mnemonic"
                component={AdaptedInput}
                label="Owner Mnemonic"
                disabled={form.submitting}
                autoComplete="off"
              />
              <Field
                name="polkadotJson"
                component={AdaptedInput}
                label="Owner Polkadot JSON"
                disabled={form.submitting}
                autoComplete="off"
              />
              <Field
                name="realPhalaSs58"
                component={AdaptedInput}
                label="Proxy Real Account"
                disabled={form.submitting}
                autoComplete="off"
              />
              <Field
                name="enabled"
                label="Enabled"
                component={AdaptedCheckbox}
                disabled={form.submitting}
              />

              <Notification
                overrides={{
                  Body: { style: { width: 'auto' } },
                }}
              >
                If both mnemonic and Polkadot JSON inputted, Polkadot JSON will
                be ignored.
              </Notification>
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

const PoolRowEditModal = ({ currentRow, clearCurrentRow }) => {
  const modalOpen = useMemo(() => !!currentRow, [currentRow])
  const updateLists = useUpdateAtom(updateAllLists)
  const ns = useAtomValue(currentNs)
  const initValues = useMemo(
    () =>
      currentRow
        ? {
            pid: currentRow.data.pid,
            name: currentRow.data.name,
            polkadotJson: currentRow.data.owner.polkadotJson,
            enabled: currentRow.data.enabled,
            realPhalaSs58: currentRow.data.realPhalaSs58,
          }
        : {},
    [currentRow]
  )
  const submit = useCallback(
    async (values) => {
      try {
        const { lifecycleManagerStateUpdate } = await queryManager({
          queryKey: [
            ns,
            {
              requestUpdatePool: {
                items: [
                  {
                    id: { uuid: currentRow.data.uuid },
                    pool: {
                      name: values.name,
                      pid: values.pid,
                      enabled: values.enabled,
                      owner: {
                        mnemonic: values.mnemonic,
                        polkadotJson: values.polkadotJson,
                      },
                      realPhalaSs58: values.realPhalaSs58,
                    },
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
    [currentRow, ns]
  )
  return (
    <Modal
      onClose={clearCurrentRow}
      isOpen={modalOpen}
      unstable_ModalBackdropScroll={true}
      closeable={false}
    >
      <ModalHeader>Edit Pool</ModalHeader>
      <PoolModalForm
        setModalClose={clearCurrentRow}
        initValues={initValues}
        onSubmit={submit}
      />
    </Modal>
  )
}

const CreatePoolModalWithButton = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const updateLists = useUpdateAtom(updateAllLists)
  const ns = useAtomValue(currentNs)

  const submit = useCallback(
    async (values) => {
      try {
        const { lifecycleManagerStateUpdate } = await queryManager({
          queryKey: [
            ns,
            {
              requestCreatePool: {
                pools: [
                  {
                    name: values.name,
                    pid: values.pid,
                    enabled: values.enabled,
                    owner: {
                      mnemonic: values.mnemonic,
                      polkadotJson: values.polkadotJson,
                    },
                    realPhalaSs58: values.realPhalaSs58,
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
    [ns, updateLists]
  )

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        shape={SHAPE.pill}
        size={SIZE.compact}
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
        <ModalHeader>Add Pool</ModalHeader>
        <PoolModalForm
          setModalClose={() => setModalOpen(false)}
          initValues={{ enabled: true }}
          onSubmit={submit}
        />
      </Modal>
    </>
  )
}

const listColumn = [
  NumericalColumn({
    title: 'PID',
    format: NUMERICAL_FORMATS.DEFAULT,
    mapDataToValue: (data) => parseInt(data.pid),
  }),
  StringColumn({
    title: 'Name',
    mapDataToValue: (data) => data.name,
  }),
  BooleanColumn({
    title: 'Enabled',
    mapDataToValue: (data) => !!data.enabled,
  }),
  StringColumn({
    title: 'Owner Account(Phala)',
    mapDataToValue: (data) => data.owner.ss58Phala,
  }),
  StringColumn({
    title: 'Owner Account(Polkadot)',
    mapDataToValue: (data) => data.owner.ss58Polkadot,
  }),
  StringColumn({
    title: 'Proxy Real Account',
    mapDataToValue: (data) => data.realPhalaSs58 || 'None',
  }),
  StringColumn({
    title: 'UUID',
    mapDataToValue: (data) => data.uuid,
  }),
]

const PoolsList = ({ pools }) => {
  const [currentRow, setCurrentRow] = useState(null)
  const [css] = useStyletron()
  const updateLists = useUpdateAtom(updateAllLists)
  const ns = useAtomValue(currentNs)
  const deleteRow = useCallback(
    async ({ row }) => {
      if (!window.confirm(`Delete pool #${row.data.pid}?`)) {
        return
      }
      const { lifecycleManagerStateUpdate } = await queryManager({
        queryKey: [
          ns,
          {
            requestUpdatePool: {
              items: [
                {
                  id: { uuid: row.data.uuid },
                  pool: {
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
    [ns, updateLists]
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
  const rows = useMemo(
    () => pools.map((i) => ({ id: i.pid, data: i })),
    [pools]
  )
  return (
    <>
      <div className={css({ height: 'calc(100vh - 270px)' })}>
        <StatefulDataTable
          columns={listColumn}
          rows={rows}
          rowActions={rowActions}
          resizableColumnWidths
        />
      </div>
      <PoolRowEditModal
        currentRow={currentRow}
        clearCurrentRow={() => setCurrentRow(null)}
      />
    </>
  )
}

const PoolsPage = () => {
  const [pools] = useAtom(poolsAtom)
  useUpdatedLists()
  return (
    <div>
      <Head>
        <title>Pools</title>
      </Head>
      <HeaderWrapper>
        <HeadingXLarge marginRight={'auto'}>Pools</HeadingXLarge>
        <NsSelector />
        <CreatePoolModalWithButton />
      </HeaderWrapper>
      <div style={{ margin: '0 42px' }}>
        <Card overrides={{ Root: { style: { width: '100%' } } }}>
          {pools.length ? (
            <PoolsList pools={pools} />
          ) : (
            <StyledBody>🈳️ Nothing found here.</StyledBody>
          )}
        </Card>
      </div>
    </div>
  )
}

export const NsSelector = () => {
  const ns = useAtomValue(currentNs)
  const setNsFn = useUpdateAtom(setNs)
  return (
    <Combobox
      mapOptionToString={(o) => o}
      options={nsList}
      value={ns}
      onChange={(e) => setNsFn(e)}
    />
  )
}

export default PoolsPage
