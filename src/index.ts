interface ResourceSpecifier {
  id: string;
  resource_type: string;
}

interface NewResourceSpecifier {
  resource_type: string;
}

enum Action { // TODO: Add values from the PG enum
  Create,
  Edit,
  Delete,
  View,
}

type AuthResult = Promise<boolean>;

interface CanFactoryUserContext {
  create: (arg0: NewResourceSpecifier) => AuthResult;
  edit: (arg0: ResourceSpecifier) => AuthResult;
  view: (arg0: ResourceSpecifier) => AuthResult;
  delete: (arg0: ResourceSpecifier) => AuthResult;
}

interface UserContext {
  user_id: string;
}

async function evaluate_permision(
  _r: ResourceSpecifier,
  _u: UserContext,
  _a: Action,
): Promise<boolean> {
  // This is where the database query takes place
  return true;
}

export function can(user_id: string): CanFactoryUserContext {
  // NOTE: possible optimisation here - this part of the factory could start a db transaction.
  return {
    edit: (resource: ResourceSpecifier): AuthResult =>
      evaluate_permision(resource, { user_id }, Action.Edit),
    create: (resource: ResourceSpecifier): AuthResult =>
      evaluate_permision(resource, { user_id }, Action.Create),
    view: (resource: ResourceSpecifier): AuthResult =>
      evaluate_permision(resource, { user_id }, Action.View),
    delete: (resource: ResourceSpecifier): AuthResult =>
      evaluate_permision(resource, { user_id }, Action.Delete),
  };
}

// This'll need something to inject an instance of an auth thing into the context of the request

can("user_id").edit({ id: "resource_id", resource_type: "Manuscript" }) ? "true" : "false";
// Should generate something like:
// SELECT * FROM AccessLog WHERE
//   user_id = 'user_id' and action_id = (
//     SELECT id from action where action = "edit" and resource = "resource_id"
//   )
