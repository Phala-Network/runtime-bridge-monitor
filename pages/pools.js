import { ALIGNMENT, Grid } from 'baseui/layout-grid'
import { AdaptedCheckbox } from 'baseui-final-form/checkbox'
import { AdaptedInput } from 'baseui-final-form/input'
import { Button, KIND, SHAPE, SIZE } from 'baseui/button'
import { Card, StyledBody } from 'baseui/card'
import { FORM_ERROR } from 'final-form'
import { Field, Form } from 'react-final-form'
import { HeadingXLarge } from 'baseui/typography'
import {
  Modal,
  ModalBody,
  ModalButton,
  ModalFooter,
  ModalHeader,
} from 'baseui/modal'
import { KIND as NOTIFICATION_KIND, Notification } from 'baseui/notification'
import { Plus } from 'baseui/icon'
import {
  pools as poolsAtom,
  updateAllLists,
  useUpdatedLists,
} from '../atoms/mgmt'
import { queryManager } from '../utils/query'
import { useAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import Head from 'next/head'

const PoolModalForm = ({ initValues, onSubmit, setModalOpen }) => {
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
      initialValues={{ enabled: true }}
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
              />
              <Field
                name="name"
                component={AdaptedInput}
                label="Name"
                disabled={form.submitting}
              />
              <Field
                name="mnemonic"
                component={AdaptedInput}
                label="Owner Mnemonic"
                disabled={form.submitting}
              />
              <Field
                name="polkadotJson"
                component={AdaptedInput}
                label="Owner Polkadot JSON"
                disabled={form.submitting}
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
                  {' '}
                  <ModalButton
                    kind={KIND.tertiary}
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </ModalButton>
                  <ModalButton type="submit">Add</ModalButton>
                </>
              )}
            </ModalFooter>
          </form>
        )
      }}
    />
  )
}

const CreatePoolModalWithButton = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const updateLists = useUpdateAtom(updateAllLists)

  const submit = useCallback(
    async (values) => {
      try {
        const { lifecycleManagerStateUpdate } = await queryManager({
          queryKey: [
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
    [updateLists]
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
          setModalOpen={setModalOpen}
          initValues={{}}
          onSubmit={submit}
        />
      </Modal>
    </>
  )
}

const PoolsList = ({ pools }) => {
  return <pre>{JSON.stringify(pools, null, 2)}</pre>
}

const PoolsPage = () => {
  const [pools] = useAtom(poolsAtom)
  useUpdatedLists()
  return (
    <div>
      <Head>
        <title>Pools</title>
      </Head>
      <Grid
        overrides={{
          Grid: { style: { marginLeft: '12px', marginRight: '12px' } },
        }}
        align={ALIGNMENT.center}
      >
        <HeadingXLarge marginRight={'auto'}>Pools</HeadingXLarge>
        <CreatePoolModalWithButton />
      </Grid>

      <Grid overrides={{ Grid: { style: { marginBottom: '42px' } } }}>
        <Card overrides={{ Root: { style: { width: '100%' } } }}>
          {pools.length ? (
            <PoolsList pools={pools} />
          ) : (
            <StyledBody>🈳️ Nothing found here.</StyledBody>
          )}
        </Card>
      </Grid>
    </div>
  )
}

export default PoolsPage
