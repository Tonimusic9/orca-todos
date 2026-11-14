// `orca plugin check` renders the panel once per scenario against a stand-in host.
import { defineCheck } from 'orca/testing'

export default defineCheck({
  noWorkspace: {}
})
