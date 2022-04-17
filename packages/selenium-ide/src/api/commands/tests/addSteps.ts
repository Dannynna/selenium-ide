import { CommandShape, TestShape } from '@seleniumhq/side-model'
import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'
import { hasID } from 'api/helpers/hasID'

export type Shape = Session['tests']['addSteps']

export const browser = browserHandler<Shape>()

export const mutator: Mutator<Shape> = (
  session,
  { params: [testID, index], result }
) => {
  const sessionWithNewCommands = update(
    'project.tests',
    (tests: TestShape[]) => {
      const testIndex = tests.findIndex(hasID(testID))
      return update(
        `${testIndex}.commands`,
        (commands: CommandShape[]) => {
          const commandsWithNewEntry = commands.slice(0)
          commandsWithNewEntry.splice(index + 1, 0, ...result)
          return commandsWithNewEntry
        },
        tests
      )
    },
    session
  )
  const activeCommand = result.slice(-1)[0] as CommandShape
  return set('state.activeCommandID', activeCommand.id, sessionWithNewCommands)
}

export const main = mainHandler<Shape>()